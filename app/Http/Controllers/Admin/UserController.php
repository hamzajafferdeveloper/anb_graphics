<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductType;
use App\Models\User;
use App\Models\UserProductAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/user/index');
    }

    public function getUsers(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = User::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%'.$request->input('search').'%')
                    ->orWhere('email', 'like', '%'.$request->input('search').'%');
            }

            $perPage = 12;
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $users->getCollection()->transform(function ($user) {
                $buyedProduct = \App\Models\SubOrder::where('user_id', $user->id)->count();
                $assignedProduct = \App\Models\UserProductAssignment::where('user_id', $user->id)
                    ->where('assignable_type', \App\Models\Product::class)
                    ->count();

                $user->buyed_product = $buyedProduct;
                $user->assigned_product = $assignedProduct;
                $user->total_product = $buyedProduct + $assignedProduct;

                return $user;
            });

            return response()->json([
                'users' => $users->items(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting users: '.$e->getMessage());

            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
                'profile_pic' => ['nullable', 'image', 'max:2048', 'mimes:jpeg,png,jpg,gif,svg'],
            ]);

            if ($request->hasFile('profile_pic')) {
                $validated['profile_pic'] = FileHelper::store($request->file('profile_pic'), 'profiles');
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'profile_pic' => $validated['profile_pic'] ?? null,
            ]);

            $role = Role::firstOrCreate(['name' => 'admin_user']);

            $user->assignRole($role->name);

            return back()->with('success', 'User created!');
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }
            Log::error($e->getMessage());

            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$id],
                'password' => ['nullable', 'string', 'min:8'],
                'profile_pic' => ['nullable', 'image', 'max:2048', 'mimes:jpeg,png,jpg,gif,svg'],
            ]);

            if ($request->hasFile('profile_pic')) {
                // Delete old one if exists
                FileHelper::delete($user->profile_pic);
                $validated['profile_pic'] = FileHelper::store($request->file('profile_pic'), 'profiles');
            }

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'profile_pic' => $validated['profile_pic'] ?? $user->profile_pic,
                'password' => ! empty($validated['password']) ? $validated['password'] : $user->password,
            ]);

            return back()->with('success', 'User updated!');
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }
            Log::error($e->getMessage());

            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);

            // delete profile pic if exists
            FileHelper::delete($user->profile_pic);
            $user->delete();

            return back()->with('success', 'User deleted!');
        } catch (\Throwable $e) {
            Log::error('Error deleting user: '.$e->getMessage());

            return back()->with('error', 'Something went wrong');
        }
    }

    public function assignProduct(string $id)
    {
        try {
            $user = User::findOrFail($id);

            $categories = ProductCategory::all();
            $types = ProductType::all();

            $search = request()->query('search', '');
            $perPage = 12;

            $products = Product::with(['images', 'brand', 'category', 'type'])
                ->when(
                    $search,
                    fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('id', 'like', "%{$search}%")
                )
                ->orderBy('name')
                ->paginate($perPage)
                ->withQueryString();

            // Get assigned IDs with proper model classes
            $assignments = UserProductAssignment::where('user_id', $user->id)->get();

            return Inertia::render('admin/user/assign-product', [
                'user' => $user,
                'categories' => $categories,
                'types' => $types,
                'products' => $products,
                'assigned' => [
                    'products' => $assignments
                        ->where('assignable_type', Product::class)
                        ->pluck('assignable_id')
                        ->toArray(),

                    'categories' => $assignments
                        ->where('assignable_type', ProductCategory::class)
                        ->pluck('assignable_id')
                        ->toArray(),

                    'types' => $assignments
                        ->where('assignable_type', ProductType::class)
                        ->pluck('assignable_id')
                        ->toArray(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error($e->getMessage());

            return back()->with('error', 'Something went wrong');
        }
    }

    public function assignProductPost(Request $request, string $id)
    {
        $request->validate([
            'products' => 'array',
            'categories' => 'array',
            'types' => 'array',
        ]);

        $user = User::findOrFail($id);

        DB::transaction(function () use ($request, $user) {

            $this->syncAssignments(
                $user->id,
                'product',
                $request->products ?? []
            );

            $this->syncAssignments(
                $user->id,
                'category',
                $request->categories ?? []
            );

            $this->syncAssignments(
                $user->id,
                'type',
                $request->types ?? []
            );
        });

        return back()->with('success', 'Permissions updated successfully');
    }

    /**
     * Sync assignments (add + remove)
     */
    private function syncAssignments(
        int $userId,
        string $type,
        array $ids
    ) {
        $modelMap = [
            'product' => Product::class,
            'category' => ProductCategory::class,
            'type' => ProductType::class,
        ];

        if (! isset($modelMap[$type])) {
            return;
        }

        $modelClass = $modelMap[$type];

        // Remove unchecked
        UserProductAssignment::where('user_id', $userId)
            ->where('assignable_type', $modelClass)
            ->whereNotIn('assignable_id', $ids)
            ->delete();

        // Add new
        foreach ($ids as $id) {
            if (empty($id)) {
                continue;
            }

            UserProductAssignment::firstOrCreate([
                'user_id' => $userId,
                'assignable_type' => $modelClass,
                'assignable_id' => $id,
            ], [
                'assigned_at' => now(),
            ]);
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Helpers\FileHelper;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
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
                $query->where('name', 'like', '%' . $request->input('search') . '%')
                    ->orWhere('email', 'like', '%' . $request->input('search') . '%');
            }

            $perPage = 12;
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'users' => $users->items(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting users: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
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
                'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $id],
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
                'password' => !empty($validated['password']) ? $validated['password'] : $user->password,
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
            Log::error('Error deleting user: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    public function assignProduct(string $id)
    {
        try {
            $categories = ProductCategory::all();
            $types = ProductType::all();
            $user = User::findOrFail($id);

            if (!$user) {
                return redirect()->back()->with('error', 'User not found');
            }

            // Get search query and page number from request
            $search = request()->query('search', '');
            $perPage = 12; // number of products per page

            // Fetch products with optional search and paginate
            $products = Product::with(['images', 'brand', 'category', 'type'])
                ->when($search, function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                ->orderBy('name')
                ->paginate($perPage)
                ->withQueryString(); // keep search query in pagination links

            return Inertia::render('admin/user/assign-product', [
                'user' => $user,
                'categories' => $categories,
                'types' => $types,
                'products' => $products,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error getting user: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    public function assignProductPost(Request $request, string $id)
    {
        dd($request->all());
    }

}

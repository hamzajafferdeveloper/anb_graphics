<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AppSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appSettings = AppSetting::all();

        return Inertia::render('admin/app-settings/index', [
            'app_settings' => $appSettings,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        try {

            $validated = $request->validate([
                'site_name' => ['required', 'string', 'max:255'],
                'site_currency' => ['required', 'string', 'max:255'],
                'site_currency_symbol' => ['required', 'string', 'max:255'],
                'site_logo' => [
                    'nullable',
                    // 'image',
                    'max:2048',
                    'mimes:jpeg,png,jpg,gif,svg',
                    'dimensions:min_width=174,min_height=40,max_width=174,max_height=40',
                ],
                'site_favicon' => [
                    'nullable',
                    // 'image',
                    'max:2048',
                    'mimes:jpeg,png,jpg,gif,svg',
                    'dimensions:min_width=32,min_height=32,max_width=32,max_height=32',
                ],
            ]);

            foreach ($validated as $key => $value) {

                if (in_array($key, ['site_logo', 'site_favicon']) && $request->hasFile($key)) {
                    $value = FileHelper::store($request->file($key), 'settings');
                }

                AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            Cache::forget('app_settings');

            $settings = Cache::rememberForever('app_settings', function () {
                return AppSetting::pluck('value', 'key')->toArray();
            });

            // Share with Inertia
            Inertia::share('appSettings', $settings);
            ;

            return back()->with('success', 'Settings updated!');

        } catch (\Throwable $e) {

            Log::error($e->getMessage());

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }

            return back()->with('error', 'Something went wrong');
        }

    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Coupon;
use App\Models\UserCoupon;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\SubOrder;

class DashboardController extends Controller
{
    /**
     * Fill in missing dates with zero values
     */
    private function fillMissingDates($data, $start, $end, $groupBy, $dateFormat)
    {
        $result = [];
        $current = $start->copy();

        while ($current <= $end) {
            $formattedDate = $current->format($groupBy === 'hour' ? 'Y-m-d H:00:00' : 'Y-m-d');
            $found = false;

            foreach ($data as $item) {
                $itemDate = $groupBy === 'hour'
                    ? Carbon::parse($item['date'] . ' ' . $item['time_group'] . ':00:00')
                    : Carbon::parse($item['date']);

                if (
                    ($groupBy === 'hour' && $current->format('Y-m-d H') === $itemDate->format('Y-m-d H')) ||
                    ($groupBy === 'day' && $current->format('Y-m-d') === $itemDate->format('Y-m-d')) ||
                    ($groupBy === 'month' && $current->format('Y-m') === $itemDate->format('Y-m'))
                ) {
                    $result[] = $item;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $result[] = [
                    'name' => $current->format($dateFormat),
                    'date' => $current->toDateString(),
                    'sales' => 0,
                    'users' => 0,
                ];
            }

            if ($groupBy === 'hour') {
                $current->addHour();
            } elseif ($groupBy === 'day') {
                $current->addDay();
            } else {
                $current->addMonth();
            }
        }

        return $result;
    }

    /**
     * Get stats for the previous period for comparison
     */
    private function getPreviousPeriodStats($start, $end, $range)
    {
        $days = $start->diffInDays($end);
        $prevStart = $start->copy()->subDays($days);
        $prevEnd = $start->copy()->subSecond();

        return [
            'revenue' => Order::whereBetween('created_at', [$prevStart, $prevEnd])
                ->where('payment_status', 'completed')
                ->sum('total_amount'),

            'orders' => Order::whereBetween('created_at', [$prevStart, $prevEnd])->count(),

            'users' => User::whereBetween('created_at', [$prevStart, $prevEnd])->count(),
        ];
    }

    /**
     * Calculate percentage change between two values
     */
    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }

    public function dashboard(Request $request)
    {
        // Get time range from request or default to 'week'
        $range = $request->input('range', 'week');

        // Set time range based on selection
        $now = Carbon::now();

        switch ($range) {
            case 'today':
                $from = $now->copy()->startOfDay();
                $groupBy = 'hour';
                $dateFormat = 'H:i';
                break;

            case 'month':
                $from = $now->copy()->subMonth();
                $groupBy = 'day';
                $dateFormat = 'M d';
                break;

            case 'year':
                $from = $now->copy()->subYear();
                $groupBy = 'month';
                $dateFormat = 'M Y';
                break;

            case 'week':
            default:
                $from = $now->copy()->subWeek();
                $groupBy = 'day';
                $dateFormat = 'D';
                break;
        }

        $to = $now;

        // ===== STATS =====
        $totalRevenue = Order::whereBetween('created_at', [$from, $to])
            ->where('payment_status', 'completed')
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('created_at', [$from, $to])->count();

        $activeUsers = User::count();

        $avgOrderValue = $totalOrders > 0
            ? round($totalRevenue / $totalOrders, 2)
            : 0;

        // ===== CHART DATA (Sales + Users by selected range) =====
        $chartQuery = Order::query()
            ->whereBetween('created_at', [$from, $to]);

        // Group by the selected time range
        if ($groupBy === 'hour') {
            $chartQuery->selectRaw('HOUR(created_at) as time_group')
                ->selectRaw('DATE(created_at) as date')
                ->groupBy('time_group', 'date');
        } elseif ($groupBy === 'day') {
            $chartQuery->selectRaw('DATE(created_at) as date')
                ->groupBy('date');
        } else { // month
            $chartQuery->selectRaw('YEAR(created_at) as year')
                ->selectRaw('MONTH(created_at) as month')
                ->groupBy('year', 'month');
        }

        // Get the data
        $chartData = $chartQuery
            ->selectRaw('SUM(total_amount) as sales')
            ->selectRaw('COUNT(DISTINCT user_id) as users')
            ->orderBy('date')
            ->get()
            ->map(function ($row) use ($dateFormat, $groupBy) {
                $date = null;

                if ($groupBy === 'hour') {
                    $date = Carbon::parse($row->date)->setHour($row->time_group);
                } elseif ($groupBy === 'day') {
                    $date = Carbon::parse($row->date);
                } else {
                    $date = Carbon::createFromDate($row->year, $row->month, 1);
                }

                return [
                    'name' => $date->format($dateFormat),
                    'date' => $date->toDateString(),
                    'sales' => (float) $row->sales,
                    'users' => (int) $row->users,
                ];
            });

        // Fill in missing dates with zero values
        $chartData = $this->fillMissingDates($chartData, $from, $to, $groupBy, $dateFormat);

        // ===== RECENT ORDERS =====
        $recentOrders = Order::latest()
            ->limit(5)
            ->get()
            ->map(fn($order) => [
                'id' => $order->order_number,
                'customer' => $order->user->name ?? 'Guest',
                'date' => $order->created_at->format('Y-m-d'),
                'amount' => $order->total_amount,
                'status' => $order->payment_status,
            ]);

        // Top 5 products by sales with images and category name
        $topProducts = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', 1);
            },
            'category' // make sure Product model has a category() relationship
        ])
            ->select('products.*')
            ->withCount([
                'subOrders as sales' => function ($query) {
                    $query->select(DB::raw('COUNT(*)'));
                }
            ])
            ->withSum([
                'subOrders as revenue' => function ($query) {
                    $query->select(DB::raw('SUM(price)'));
                }
            ], 'price')
            ->orderByDesc('sales')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category->name ?? 'Uncategorized', // category name
                    'image' => $product->images->first()?->path
                        ? asset('storage/' . $product->images->first()->path)
                        : null,
                    'sales' => $product->sales,
                    'revenue' => $product->revenue,
                ];
            });

        // Calculate percentage changes
        $previousPeriod = $this->getPreviousPeriodStats($from, $to, $range);

        // Get recent coupon purchases
        $recentCoupons = UserCoupon::with(['user', 'coupon'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($userCoupon) {
                return [
                    'id' => $userCoupon->id,
                    'code' => $userCoupon->code,
                    'user' => $userCoupon->user->name,
                    'discount' => $userCoupon->coupon->discount,
                    'price' => $userCoupon->coupon->price,
                    'purchased_at' => $userCoupon->created_at->format('Y-m-d H:i'),
                    'status' => $userCoupon->status ? 'active' : 'used',
                ];
            });

        // Get coupon statistics
        $couponStats = [
            // Total coupons purchased (rows in user_coupons)
            'totalPurchased' => UserCoupon::count(),

            // Active purchased coupons
            'activeCoupons' => UserCoupon::where('status', true)->count(),

            // Total revenue from purchased coupons
            'totalRevenue' => UserCoupon::whereHas('coupon')
                ->join('coupons', 'user_coupons.coupon_id', '=', 'coupons.id')
                ->sum('coupons.price'),

            // Monthly revenue from purchased coupons
            'monthlyRevenue' => UserCoupon::whereHas('coupon')
                ->whereMonth('user_coupons.created_at', now()->month)
                ->whereYear('user_coupons.created_at', now()->year)
                ->join('coupons', 'user_coupons.coupon_id', '=', 'coupons.id')
                ->sum('coupons.price'),
        ];

        return Inertia::render('dashboard', [
            'stats' => [
                'revenue' => $totalRevenue,
                'orders' => $totalOrders,
                'users' => $activeUsers,
                'avgOrderValue' => $avgOrderValue,
                'revenueChange' => $this->calculatePercentageChange($previousPeriod['revenue'], $totalRevenue),
                'ordersChange' => $this->calculatePercentageChange($previousPeriod['orders'], $totalOrders),
                'usersChange' => $this->calculatePercentageChange($previousPeriod['users'], $activeUsers),
            ],
            'chartData' => $chartData,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'recentCoupons' => $recentCoupons,
            'couponStats' => $couponStats,
        ]);
    }
}

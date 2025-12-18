import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    DollarSign,
    RefreshCw,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <p className="text-sm font-medium">{label}</p>
                <div className="mt-1 space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div
                            key={`item-${index}`}
                            className="flex items-center"
                        >
                            <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs">
                                {entry.name}:{' '}
                                <span className="font-medium">
                                    {entry.name === 'Sales'
                                        ? `$${entry.value}`
                                        : entry.value}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

/* ---------------- TYPES ---------------- */

type ChartPoint = {
    name: string;
    sales: number;
    users: number;
};

type Order = {
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: 'completed' | 'processing' | 'pending';
};

type Product = {
    id: number;
    name: string;
    image: string;
    category: string;
    sales: number;
    revenue: number;
};
type Coupon = {
    id: number;
    code: string;
    user: string;
    discount: number;
    price: number;
    purchased_at: string;
    status: 'active' | 'used';
};
type CouponStats = {
    totalPurchased: number;
    activeCoupons: number;
    totalRevenue: number;
    monthlyRevenue: number;
};

type DashboardProps = {
    stats: {
        revenue: number;
        orders: number;
        users: number;
        avgOrderValue: number;
    };
    chartData: ChartPoint[];
    recentOrders: Order[];
    topProducts: Product[];
    recentCoupons: Coupon[];
    couponStats: CouponStats;
};

type TimeRange = 'today' | 'week' | 'month' | 'year';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();
    const {
        stats,
        chartData,
        recentOrders,
        topProducts,
        recentCoupons,
        couponStats,
    } = props;

    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [isLoading, setIsLoading] = useState(false);
    const [isChartLoading, setIsChartLoading] = useState(false);

    const refreshData = () => {
        setIsLoading(true);
        router.reload({
            onFinish: () => setIsLoading(false),
        });
    };

    const handleTimeRangeChange = (range: TimeRange) => {
        setTimeRange(range);
        setIsChartLoading(true);

        // In a real implementation, you would fetch new data here
        // For now, we'll just simulate a loading state
        setTimeout(() => {
            setIsChartLoading(false);
        }, 500);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome back, Admin
                        </h2>
                        <p className="text-muted-foreground">
                            Here's what's happening with your store
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${
                                    isLoading ? 'animate-spin' : ''
                                }`}
                            />
                            Refresh
                        </Button>
                        {/* <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button> */}
                    </div>
                </div>

                {/* STATS */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.revenue.toLocaleString()}`}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend={12.5}
                        trendText="vs last month"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.orders.toLocaleString()}
                        icon={<ShoppingBag className="h-4 w-4" />}
                        trend={8.2}
                        trendText="vs last month"
                    />
                    <StatCard
                        title="Active Users"
                        value={stats.users.toLocaleString()}
                        icon={<Users className="h-4 w-4" />}
                        trend={5.7}
                        trendText="vs last week"
                    />
                    <StatCard
                        title="Avg. Order Value"
                        value={`$${stats.avgOrderValue.toFixed(2)}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend={3.4}
                        trendText="vs last month"
                    />
                </div>

                {/* CHARTS */}
                <div className="grid gap-6 lg:grid-cols-7">
                    <motion.div
                        className="lg:col-span-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="h-full border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Revenue & Users
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Track your store's performance
                                        </p>
                                    </div>
                                    <Select
                                        value={timeRange}
                                        onValueChange={handleTimeRangeChange}
                                        disabled={isChartLoading}
                                    >
                                        <SelectTrigger className="h-8 w-[120px] text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">
                                                Today
                                            </SelectItem>
                                            <SelectItem value="week">
                                                This Week
                                            </SelectItem>
                                            <SelectItem value="month">
                                                This Month
                                            </SelectItem>
                                            <SelectItem value="year">
                                                This Year
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="relative h-[300px]">
                                    {isChartLoading ? (
                                        <div className="flex h-full items-center justify-center">
                                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <AreaChart
                                                data={chartData}
                                                margin={{
                                                    top: 10,
                                                    right: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="salesGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#6366f1"
                                                            stopOpacity={0.2}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#6366f1"
                                                            stopOpacity={0.02}
                                                        />
                                                    </linearGradient>
                                                    <linearGradient
                                                        id="usersGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0.2}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0.02}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#f0f0f0"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: '#6b7280',
                                                        fontSize: 12,
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    orientation="left"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: '#6b7280',
                                                        fontSize: 12,
                                                    }}
                                                    tickFormatter={(value) =>
                                                        `$${value}`
                                                    }
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: '#6b7280',
                                                        fontSize: 12,
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 1,
                                                    }}
                                                />
                                                <Area
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="sales"
                                                    name="Sales"
                                                    stroke="#6366f1"
                                                    fillOpacity={1}
                                                    fill="url(#salesGradient)"
                                                    strokeWidth={2}
                                                    activeDot={{
                                                        r: 6,
                                                        strokeWidth: 0,
                                                        fill: '#4f46e5',
                                                    }}
                                                />
                                                <Area
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="users"
                                                    name="Users"
                                                    stroke="#10b981"
                                                    fillOpacity={1}
                                                    fill="url(#usersGradient)"
                                                    strokeWidth={2}
                                                    activeDot={{
                                                        r: 6,
                                                        strokeWidth: 0,
                                                        fill: '#059669',
                                                    }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <div className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></div>
                                        <span>Revenue</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                                        <span>Active Users</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Card className="h-full border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Top Products</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Best selling products this month
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {topProducts.map((p, index) => {
                                    const progress = Math.min(
                                        100,
                                        (p.sales / 1000) * 100,
                                    );
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                        {p.image && (
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm leading-none font-medium">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {p.category}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {p.sales} sold
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        $
                                                        {(
                                                            p.revenue || 0
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* RECENT ORDERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Orders</CardTitle>
                                    <CardDescription>
                                        Latest store transactions
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                >
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[100px]">
                                                Order
                                            </TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentOrders.map((order, index) => (
                                            <TableRow
                                                key={index}
                                                className="border-t"
                                            >
                                                <TableCell className="font-medium">
                                                    #
                                                    {(
                                                        '000' +
                                                        (index + 1)
                                                    ).slice(-3)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {order.customer}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {order.date}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={
                                                            order.status ===
                                                            'completed'
                                                                ? 'default'
                                                                : order.status ===
                                                                    'processing'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                        className="rounded-full px-2.5 py-0.5 text-xs"
                                                    >
                                                        {order.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            order.status.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="border-t px-6 py-3 text-sm text-muted-foreground">
                                Showing <span className="font-medium">1</span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(5, recentOrders.length)}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {recentOrders.length}
                                </span>{' '}
                                orders
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className=""
                >
                    {/* Coupon Stats */}
                    <div className="col-span-1">
                        <Card className="h-full border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Coupon Stats</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Overview of coupon performance
                                </p>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Total Purchased */}
                                <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Purchased
                                        </p>
                                        <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline">
                                        <div className="text-2xl font-bold">
                                            {couponStats.totalPurchased}
                                        </div>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            coupons
                                        </span>
                                    </div>
                                </div>

                                {/* Active Coupons */}
                                <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Coupons
                                        </p>
                                        <div className="rounded-full bg-green-100 p-2 text-green-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline">
                                        <div className="text-2xl font-bold text-green-500">
                                            {couponStats.activeCoupons}
                                        </div>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            active now
                                        </span>
                                    </div>
                                </div>

                                {/* Total Revenue */}
                                <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Revenue
                                        </p>
                                        <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line
                                                    x1="12"
                                                    y1="1"
                                                    x2="12"
                                                    y2="23"
                                                />
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline">
                                        <div className="text-2xl font-bold">
                                            $
                                            {couponStats.totalRevenue.toLocaleString()}
                                        </div>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            all time
                                        </span>
                                    </div>
                                </div>

                                {/* This Month */}
                                <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            This Month
                                        </p>
                                        <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    x="3"
                                                    y="4"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <line
                                                    x1="16"
                                                    y1="2"
                                                    x2="16"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="8"
                                                    y1="2"
                                                    x2="8"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="3"
                                                    y1="10"
                                                    x2="21"
                                                    y2="10"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline">
                                        <div className="text-2xl font-bold">
                                            $
                                            {couponStats.monthlyRevenue.toLocaleString()}
                                        </div>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            current month
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Recent Coupons */}
                    <div className="lg:col-span-3">
                        <Card className="h-full border-0 shadow-sm">
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Recently Purchased Coupons
                                        </CardTitle>
                                        <CardDescription>
                                            Latest coupon purchases and
                                            redemptions
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Code</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Purchased</TableHead>
                                                <TableHead className="text-right">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentCoupons.map((coupon) => (
                                                <TableRow
                                                    key={coupon.id}
                                                    className="border-t"
                                                >
                                                    <TableCell className="font-mono font-medium">
                                                        {coupon.code}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {coupon.user}
                                                    </TableCell>
                                                    <TableCell>
                                                        {coupon.discount}%
                                                    </TableCell>
                                                    <TableCell>
                                                        ${coupon.price}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(
                                                            coupon.purchased_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant={
                                                                coupon.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className={
                                                                coupon.status ===
                                                                'active'
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                    : ''
                                                            }
                                                        >
                                                            {coupon.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                coupon.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {recentCoupons.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No coupon purchases
                                                        found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

/* ---------------- HELPERS ---------------- */

function StatCard({
    title,
    value,
    icon,
    trend,
    trendText,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    trendText?: string;
}) {
    const isPositive = trend && trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="h-full transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            {icon}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {trend !== undefined && (
                        <div className="mt-2 flex items-center">
                            <span
                                className={`flex items-center text-sm ${
                                    isPositive
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}
                            >
                                <ArrowUpRight
                                    className={`mr-1 h-4 w-4 ${!isPositive ? 'rotate-90 transform' : ''}`}
                                />
                                {trend}%
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                                {trendText ||
                                    (isPositive
                                        ? 'vs last period'
                                        : 'vs last period')}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

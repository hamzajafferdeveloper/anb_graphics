import UserLayout from '@/layouts/user-layout'
import { home } from '@/routes';
import user from '@/routes/user';
import { BreadcrumbItem } from '@/types';
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: user.dashboard().url,
    },
    {
        title: 'Products',
        href: user.products().url,
    },
];

const UserProduct = () => {
  return (
    <UserLayout breadcrumbs={breadcrumbs}>UserDashboard</UserLayout>
  )
}

export default UserProduct

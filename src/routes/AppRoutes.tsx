import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { RequireAdmin, RequireAuth } from '@/routes/guards'
import Account from '@/pages/Account'
import Banners from '@/pages/Banners'
import Categories from '@/pages/Categories'
import CustomerDetail from '@/pages/CustomerDetail'
import Customers from '@/pages/Customers'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import OrderDetail from '@/pages/OrderDetail'
import Orders from '@/pages/Orders'
import Overview from '@/pages/Overview'
import Payments from '@/pages/Payments'
import ProductEditor from '@/pages/ProductEditor'
import Products from '@/pages/Products'
import Settings from '@/pages/Settings'
import Team from '@/pages/Team'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductEditor />} />
          <Route path="/products/:id" element={<ProductEditor />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/account" element={<Account />} />
          <Route element={<RequireAdmin />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/team" element={<Team />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes

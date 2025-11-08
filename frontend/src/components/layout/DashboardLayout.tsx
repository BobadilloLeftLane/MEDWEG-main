import { useState, useMemo, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  ShoppingCart,
  Logout,
  AccountCircle,
  Business,
  Calculate,
  Warehouse,
  LocalShipping,
  Description,
  Warning as WarningIcon,
  Loop,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuthStore, UserRole } from '../../store/authStore';
import * as orderApi from '../../api/orderApi';
import * as warehouseApi from '../../api/warehouseApi';

const DRAWER_WIDTH = 260;

interface NavItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

/**
 * Dashboard Layout Component
 * Responsive layout with sidebar navigation and app bar
 */
const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Fetch pending orders count and low stock count for admin_application
  useEffect(() => {
    if (user?.role === UserRole.ADMIN_APPLICATION) {
      const fetchPendingOrders = async () => {
        try {
          // Fetch all pending orders (no pagination) to get accurate count
          const result = await orderApi.getAllOrders({ status: 'pending', limit: 9999 });
          const unconfirmedCount = result.orders.filter(order => !order.is_confirmed).length;
          setPendingOrdersCount(unconfirmedCount);
        } catch (error) {
          console.error('Failed to fetch pending orders:', error);
        }
      };

      const fetchLowStockCount = async () => {
        try {
          const count = await warehouseApi.getLowStockAlertsCount();
          setLowStockCount(count);
        } catch (error) {
          console.error('Failed to fetch low stock count:', error);
        }
      };

      fetchPendingOrders();
      fetchLowStockCount();

      // Listen for order confirmation events to update badge immediately
      const handleOrderConfirmed = () => {
        fetchPendingOrders();
      };
      window.addEventListener('orderConfirmed', handleOrderConfirmed);

      // Poll every 30 seconds for new orders and stock alerts
      const interval = setInterval(() => {
        fetchPendingOrders();
        fetchLowStockCount();
      }, 30000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('orderConfirmed', handleOrderConfirmed);
      };
    }
  }, [user]);

  // Determine the base path based on user role
  const basePath = useMemo(() => {
    if (!user) return '/dashboard';

    switch (user.role) {
      case UserRole.ADMIN_APPLICATION:
        return '/admin';
      case UserRole.ADMIN_INSTITUTION:
        return '/institution';
      default:
        return '/dashboard';
    }
  }, [user]);

  // Navigation items with role-based paths
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { text: 'Dashboard', icon: <Dashboard />, path: `${basePath}/dashboard` },
    ];

    // ADMIN_APPLICATION: Manages Companies (Kunden) and Products
    if (user?.role === UserRole.ADMIN_APPLICATION) {
      items.push(
        { text: 'Kunden', icon: <Business />, path: `${basePath}/customers` },
        { text: 'Produkte', icon: <Inventory />, path: `${basePath}/products` },
        { text: 'Bestellungen', icon: <ShoppingCart />, path: `${basePath}/orders` },
        { text: 'Kalkulator', icon: <Calculate />, path: `${basePath}/calculator` },
        { text: 'Lager', icon: <Warehouse />, path: `${basePath}/warehouse` },
        { text: 'Transportdienst', icon: <LocalShipping />, path: `${basePath}/transport` },
        { text: 'Dokumentation', icon: <Description />, path: `${basePath}/documentation` },
      );
    }

    // ADMIN_INSTITUTION: Manages their own Patients, Products, Orders
    if (user?.role === UserRole.ADMIN_INSTITUTION) {
      items.push(
        { text: 'Patienten', icon: <People />, path: `${basePath}/patients` },
        { text: 'Produkte', icon: <Inventory />, path: `${basePath}/products` },
        { text: 'Bestellungen', icon: <ShoppingCart />, path: `${basePath}/orders` },
        { text: 'Automatische Bestellungen', icon: <Loop />, path: `${basePath}/recurring-orders` },
      );
    }

    return items;
  }, [basePath, user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout API call
    const clearAuth = useAuthStore.getState().clearAuth;
    clearAuth();
    toast.success('Erfolgreich abgemeldet');
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Title */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Dashboard sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.5px',
          }}
        >
          MEDWEG
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isOrdersPage = item.text === 'Bestellungen';
          const isWarehousePage = item.text === 'Lager';
          const showOrdersBadge = isOrdersPage && user?.role === UserRole.ADMIN_APPLICATION && pendingOrdersCount > 0;
          const showWarehouseBadge = isWarehousePage && user?.role === UserRole.ADMIN_APPLICATION && lowStockCount > 0;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'primary.main',
                    minWidth: 40,
                  }}
                >
                  {showOrdersBadge ? (
                    <Badge
                      badgeContent={pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                      color="error"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          fontWeight: 700,
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : showWarehouseBadge ? (
                    <Badge
                      badgeContent={lowStockCount > 99 ? '99+' : lowStockCount}
                      color="error"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          fontWeight: 700,
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Institution Info */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
            }}
          >
            M
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Muster Institution
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              admin@medweg.de
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            {user?.role === UserRole.ADMIN_APPLICATION && pendingOrdersCount > 0 ? (
              <Badge
                badgeContent={pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16,
                    fontWeight: 700,
                  }
                }}
              >
                <MenuIcon />
              </Badge>
            ) : (
              <MenuIcon />
            )}
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}
          >
            {navItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Low Stock Alert Icon */}
          {user?.role === UserRole.ADMIN_APPLICATION && lowStockCount > 0 && (
            <Tooltip title={`${lowStockCount} Produkt${lowStockCount > 1 ? 'e' : ''} mit niedrigem Bestand`}>
              <IconButton
                onClick={() => navigate('/admin/warehouse')}
                sx={{
                  mr: 1,
                  color: 'error.main',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Badge
                  badgeContent={lowStockCount > 99 ? '99+' : lowStockCount}
                  color="error"
                  max={99}
                >
                  <WarningIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <IconButton onClick={handleMenuOpen} sx={{ color: 'text.primary' }}>
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Abmelden</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

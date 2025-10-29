"use client";

import { useThemeMode } from '@/app/components/theme/theme-provider';
import Logo from '@/public/logo';
import MenuIcon from '@mui/icons-material/Menu';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const navItems = [
  { title: 'Routes', path: '/protected/routes' },
  { title: 'Airports', path: '/protected/airports' },
  { title: 'Airlines', path: '/protected/airlines' },
];

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleThemeMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Theme Toggle Button Component
  const ThemeToggleButton = (
    <IconButton
      color="primary"
      onClick={toggleThemeMode}
      title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {mode === 'light' ? <NightsStayIcon /> : <WbSunnyIcon />}
    </IconButton>
  );

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: 'center',
        width: 250,
        bgcolor: theme.palette.background.paper,
        minHeight: '100%',
      }}
    >
      {/* Drawer Header (Logo/Title and Theme Toggle) */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography
          variant="h6"
          sx={{ color: theme.palette.primary.main, flexGrow: 1 }}
        >
          TravelHub
        </Typography>
        {ThemeToggleButton}
      </Box>

      <List>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  textAlign: 'center',
                  bgcolor: isActive ? theme.palette.action.selected : 'transparent',
                }}
              >
                <ListItemText
                  primary={item.title}
                  slotProps={{
                    primary: {
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      fontWeight: isActive ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <AppBar component="nav" position="static" sx={{
      bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[2], borderBottom: { xs: `2px solid ${theme.palette.primary.main}`, md: `1px solid transparent` },
    }}>
      <Toolbar sx={{
        paddingLeft: { xs: 2, sm: 3 },
        paddingRight: { xs: 2, sm: 3 },
        justifyContent: 'space-between',
      }}>

        {/* Left Side Content Group */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, ml: -1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Logo />
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);

              return (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  variant='text'
                  color="inherit"
                  sx={{
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    fontWeight: isActive ? 600 : 400,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover,
                    }
                  }}
                >
                  {item.title}
                </Button>
              );
            })}

            {ThemeToggleButton}
          </Box>
        )}
      </Toolbar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 250,
              bgcolor: theme.palette.background.paper
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </AppBar>
  );
};

export default Navbar;
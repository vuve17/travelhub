'use client'

import Link from "next/link";
import { Container, Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Home() {
    const theme = useTheme();
    return (
        <Container
            maxWidth={false}
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme.palette.background.default,
                p: theme.spacing(4),
            }}
        >
            <Box
                component="main"
                sx={{
                    width: '100%',
                    maxWidth: 800,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: theme.spacing(4), sm: theme.spacing(8) },
                    bgcolor: theme.palette.background.paper,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[8],
                    textAlign: 'center',
                    gap: theme.spacing(5),
                }}
            >

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>

                    <TravelExploreIcon
                        sx={{
                            fontSize: 60,
                            color: theme.palette.primary.main,
                        }}
                    />

                    <Typography
                        variant="h3"
                        component="h1"
                        color="text.primary"
                        fontWeight={theme.typography.fontWeightBold}
                        sx={{ mt: 1 }}
                    >
                        TravelHub
                    </Typography>

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mt: 1 }}
                    >
                        Your centralized system for managing <strong>airports</strong>, <strong>airlines</strong>, and <strong>routes</strong>. TravelHub is a solution for data modeling and displaying key elements of passenger infrastructure.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: theme.spacing(2),
                        width: '100%',
                        justifyContent: 'center'
                    }}
                >

                    <Button
                        component={Link}
                        href="/login"
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                            width: { xs: '100%', sm: 180 },
                            py: theme.spacing(1.5),
                        }}
                    >
                        Login
                    </Button>

                    <Button
                        component={Link}
                        href="/register"
                        variant="outlined"
                        size="large"
                        startIcon={<PersonAddIcon />}
                        color="inherit"
                        sx={{
                            width: { xs: '100%', sm: 180 },
                            py: theme.spacing(1.5),
                        }}
                    >
                        Register
                    </Button>

                </Box>

            </Box>
        </Container>
    );
}


// 
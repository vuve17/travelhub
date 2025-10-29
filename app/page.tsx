'use client'

import LoginIcon from '@mui/icons-material/Login';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Box, Button, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";

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
                // ⭐️ 1. Postavite kontejner na 'relative' za apsolutno pozicioniranje pozadine
                position: 'relative',
                bgcolor: theme.palette.background.default,
                p: theme.spacing(4),
                // Uklonjena svojstva backgroundImage i filter s glavnog Containera
            }}
        >
            {/* ⭐️ 2. NOVI BOX ZA POZADINU (BLUR) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0, // Mora biti ispod glavnog sadržaja (Box)
                    backgroundImage: 'url(/world-with-locations-bg-img.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    // ⭐️ Ovdje primijenite blur filter i eventualno brightness
                    filter: 'blur(3px) brightness(0.8)',
                }}
            />
            {/* Korištenje zIndex: 1 za glavni sadržaj osigurava da je iznad blur sloja */}
            <Box
                component="main"
                sx={{
                    zIndex: 1,
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
                        href="/protected/airports"
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                            width: { xs: '100%', sm: 250 },
                            py: theme.spacing(1.5),
                        }}
                    >
                        Let&apos;s Get Started
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
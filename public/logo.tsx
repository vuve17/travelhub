import { Typography, useTheme } from "@mui/material";
import Link from "next/link";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

const Logo = () => {
  const theme = useTheme()
  return (
    <Typography
      variant="h6"
      component={Link}
      href="/"
      sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', color: theme.palette.primary.main, textDecoration: 'none' }}
    >
      <TravelExploreIcon sx={{ mr: 1 }} />
      TravelHub
    </Typography>
  )
}
export default Logo;
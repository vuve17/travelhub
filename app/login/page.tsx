// "use client";

// import {
//   Button,
//   IconButton,
//   InputAdornment,
//   Paper,
//   TextField,
//   useTheme
// } from "@mui/material";
// import { useFormik } from "formik";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import * as Yup from "yup";
// import ErrorBox from "../components/error-message-box";

// export const dynamic = "force-dynamic";

// const registerSchema = Yup.object().shape({
//   email: Yup.string()
//     .email("Please eneter valid email")
//     .required("Email is required"),
//   password: Yup.string().min(6).required("Password is required"),
// });

// const initialValues = {
//   email: "",
//   password: "",
// };

// const LogInForm: React.FC = () => {
//   const [disableButton, setDisableButtons] = useState<boolean>(false);
//   const [passwordState, setPasswordState] = useState("show");
//   const [passwordError, setPasswordError] = useState("");
//   const router = useRouter();
//   const theme = useTheme();

//   const HandlePasswordState = () => {
//     if (passwordState == "show") {
//       setPasswordState("hide");
//     } else {
//       setPasswordState("show");
//     }
//   };

//   const formik = useFormik({
//     initialValues: initialValues,
//     validationSchema: registerSchema,
//     onSubmit: async (values) => {
//       setDisableButtons(true);

//       try {
//         const response = await fetch("/api/login", {
//           method: "POST",
//           body: JSON.stringify(values),
//         });

//         if (!response.ok) {
//           console.log("Response error:", response.status, response.statusText);
//           const data = await response.json();
//           console.log("Error message:", data.message);
//           setPasswordError(data.message);
//           console.log("Response not OK");
//         }

//         const { refreshToken, accessToken, message } = await response.json();
//         // console.log(refreshToken, accessToken, message);

//         if (refreshToken && accessToken) {
//           document.cookie = `refreshToken=${refreshToken}; path=/`;
//           document.cookie = `accessToken=${accessToken}; path=/`;
//           // sessionStorage.setItem('cameFromRegister', 'true');
//           router.push("/scheduler");
//         }
//       } catch (error) {
//         console.log("Else set pass error: Bad keys - frontend message");
//         setPasswordError("Wrong username or password");
//       } finally {
//         setDisableButtons(false);
//       }
//     },
//   });

//   return (
//     <Paper
//       square={false}
//       sx={{
//         display: "flex",
//         outline: {
//           lg: `2px solid ${theme.palette.primary.main}`,
//           md: `2px solid ${theme.palette.primary.main}`,
//           sm: "none",
//         },
//         padding: {
//           lg: "2em 5em 2em",
//           md: "2em 5em 2em",
//           sm: "3em",
//           xs: "3em",
//         },
//         flexDirection: "column",
//         boxShadow: "none",
//         alignItems: "center",
//         justifyContent: "center",
//         width: {
//           sm: "100vw",
//           lg: "15em",
//           md: "15em",
//         },
//         // navbar height
//         marginTop: "80px",
//       }}
//     >
//       <form onSubmit={formik.handleSubmit} style={{ marginBottom: "1em" }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//           }}
//         >
//           <h1
//             style={{
//               marginTop: "1em",
//               display: "flex",
//               color: `${theme.palette.primary.main}`,
//             }}
//           >
//             Log in
//             <Image
//               src="\svg\login-person.svg"
//               alt="person SVG"
//               width={40}
//               height={40}
//               style={{
//                 marginLeft: "10px",
//               }}
//             />
//           </h1>
//           <TextField
//             label="email"
//             name="email"
//             type="email"
//             value={formik.values.email}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             style={{
//               marginTop: "1em",
//               minWidth: "267px",
//             }}
//           />

//           <TextField
//             label="password"
//             name="password"
//             type={passwordState === "show" ? "password" : "text"}
//             value={formik.values.password}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             onClick={() => setPasswordError("")}
//             autoComplete="off"
//             style={{
//               margin: " 1em 0 1em 0 ",
//               minWidth: "267px",
//             }}
//             slotProps={{
//               input: {
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={HandlePasswordState}>
//                       <Image
//                         src={`/svg/eye-password-${passwordState}.svg`}
//                         alt={`${passwordState} password`}
//                         width={20}
//                         height={20}
//                       />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }
//             }}
//           />
//           {formik.errors.email && formik.touched.email ? (
//             <ErrorBox text={formik.errors.email} theme={theme}/>
//           ) : formik.errors.password && formik.touched.password ? (
//             <ErrorBox text={formik.errors.password} theme={theme}/>
//           ) : (
//             <ErrorBox text={passwordError} theme={theme}/>
//           )}
//         </div>

//         <div style={{ display: "flex", justifyContent: "center" }}>
//           <Button
//             variant="contained"
//             type="submit"
//             sx={{
//               backgroundColor: `${theme.palette.primary.main}`,
//             }}
//             disabled={disableButton}
//           >
//             <div className="openSansSemiBold">Log in</div>
//           </Button>
//         </div>
//       </form>

//       <div
//         style={{
//           marginTop: "1em",
//           display: "flex",
//           justifyContent: "center",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <div>Don&apos;t have an account? </div>
//         <Link
//           href="/register"
//           style={{
//             marginLeft: "0.1em",
//           }}
//         >
//           Register
//         </Link>
//       </div>
//     </Paper>
//   );
// };

// export default LogInForm;


"use client";

import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import * as Yup from "yup";
import ErrorBox from "../components/public/error-message-box";

export const dynamic = "force-dynamic";

const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter valid email")
    .required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

const LogInForm: React.FC = () => {
  const [disableButton, setDisableButtons] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const theme = useTheme();
  
  const HandlePasswordState = () => {
    setShowPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setDisableButtons(true);

      try {
        const response = await fetch("/api/log-in", {
          method: "POST",
          body: JSON.stringify(values),
        });
        
        const data = await response.json();

        if (!response.ok) {
          console.log("Response error:", response.status, response.statusText);
          console.log("Error message:", data.message);
          setPasswordError(data.message || "Login failed due to server error.");
        } else {
            const { refreshToken, accessToken } = data;

            if (refreshToken && accessToken) {
                document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=Lax`;
                document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=Lax`;
                router.push("/scheduler");
            } else {
                 setPasswordError("Login successful, but tokens are missing.");
            }
        }
      } catch (error) {
        console.error("Catch error during login:", error);
        setPasswordError("Wrong username or password.");
      } finally {
        setDisableButtons(false);
      }
    },
  });

  return (
    // Container: Mimics the full-screen centered background of the Home page
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
      <Paper
        component={Box}
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.background.paper, 
          p: { xs: theme.spacing(4), sm: theme.spacing(6) }, 
          borderRadius: theme.shape.borderRadius, 
          textAlign: 'center',
          gap: theme.spacing(3), 
        }}
      >
        <Box 
            component="form" 
            onSubmit={formik.handleSubmit} 
            sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                width: '100%', 
                gap: theme.spacing(2) 
            }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            fontWeight={theme.typography.fontWeightBold}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: theme.spacing(3),
            }}
          >
            Log in
            <LoginIcon sx={{ fontSize: 40, ml: 1 }} />
          </Typography>
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.email && formik.touched.email}
            helperText={formik.errors.email && formik.touched.email ? formik.errors.email : ''}
            variant="outlined"
            size="medium"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onClick={() => setPasswordError("")}
            autoComplete="off"
            error={!!formik.errors.password && formik.touched.password}
            helperText={formik.errors.password && formik.touched.password ? formik.errors.password : ''}
            variant="outlined"
            size="medium"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={HandlePasswordState} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* Centralized error display */}
          {passwordError && (
            <ErrorBox text={passwordError} theme={theme}/>
          )}

          <Button
            variant="contained"
            type="submit"
            size="large"
            disabled={disableButton || !formik.isValid}
            sx={{
              width: { xs: '100%', sm: 180 }, 
              py: theme.spacing(1.5),
              mt: theme.spacing(2)
            }}
          >
            Log in
          </Button>
        </Box>

        <Box
          sx={{
            mt: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            Don&apos;t have an account?
            <Link
              href="/register"
              style={{
                marginLeft: theme.spacing(0.5),
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontWeight: theme.typography.fontWeightMedium
              }}
            >
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LogInForm;
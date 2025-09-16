/*import { createTheme } from '@mui/material';

export const colors = [
  "#4F6D7A",  // soft blue-gray
  "#56B4D3",  // aqua blue
  "#F4A259",  // soft orange
  "#8ABEB7",  // muted teal
  "#C1C8E4",  // soft lavender
  "#D3D3D3"   // neutral gray
];

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8FAFC",   // very light gray background
      paper: "#FFFFFF"      // pure white cards
    },
    primary: {
      main: "#1976D2",      // professional blue
      light: "#63A4FF",
      dark: "#004BA0"
    },
    secondary: {
      main: "#4F6D7A",      // muted blue-gray accent
      light: "#7A9BAE",
      dark: "#2E4B57"
    },
    error: {
      main: "#E53935"
    },
    success: {
      main: "#2E7D32"
    },
    warning: {
      main: "#F4A259"       // warm accent orange
    },
    info: {
      main: "#0288D1"       // info blue
    },
    text: {
      primary: "#1E293B",   // near-black for readability
      secondary: "#475569"  // muted gray for less important text
    }
  },
  typography: {
    fontFamily: "Lato, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    subtitle1: {
      opacity: 0.8,
      fontWeight: 300
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiIconButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10
        }
      }
    },
    MuiSnackbarContent: {
      styleOverrides: {
        message: {
          fontWeight: 600,
          textTransform: "capitalize"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(25, 118, 210, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(25, 118, 210, 0.4)'
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  }
});

export default theme;*/


//2nd theme
/*import { createTheme } from '@mui/material';

export const colors = [
  "#4F6D7A",  // soft blue-gray
  "#56B4D3",  // aqua blue
  "#F4A259",  // soft orange
  "#8ABEB7",  // muted teal
  "#C1C8E4",  // soft lavender
  "#D3D3D3"   // neutral gray
];

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F172A",   // deep slate background
      paper: "#1E293B"      // slightly lighter cards
    },
    primary: {
      main: "#63A4FF",      // softer blue highlight
      light: "#8EC9FF",
      dark: "#1976D2"
    },
    secondary: {
      main: "#8ABEB7",      // muted teal for accents
      light: "#A5D7D0",
      dark: "#4F6D7A"
    },
    error: {
      main: "#FF6B6B"
    },
    success: {
      main: "#4CAF50"
    },
    warning: {
      main: "#F4A259"       // warm orange accent
    },
    info: {
      main: "#56B4D3"
    },
    text: {
      primary: "#F1F5F9",   // almost white for readability
      secondary: "#CBD5E1"  // soft gray for muted text
    }
  },
  typography: {
    fontFamily: "Lato, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    subtitle1: {
      opacity: 0.85,
      fontWeight: 300
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiIconButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10
        }
      }
    },
    MuiSnackbarContent: {
      styleOverrides: {
        message: {
          fontWeight: 600,
          textTransform: "capitalize"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(99, 164, 255, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(99, 164, 255, 0.4)'
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  }
});

export default darkTheme;*/


//3rd theme
import { createTheme, responsiveFontSizes } from "@mui/material";

export const colors = [
  "#4F6D7A",  // soft blue-gray
  "#56B4D3",  // aqua blue
  "#F4A259",  // soft orange
  "#8ABEB7",  // muted teal
  "#C1C8E4",  // soft lavender
  "#D3D3D3"   // neutral gray
];

let theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8FAFC",   // very light gray background
      paper: "#FFFFFF"      // pure white cards
    },
    primary: {
      main: "#1976D2",      // professional blue
      light: "#63A4FF",
      dark: "#004BA0"
    },
    secondary: {
      main: "#4F6D7A",      // muted blue-gray accent
      light: "#7A9BAE",
      dark: "#2E4B57"
    },
    error: {
      main: "#E53935"
    },
    success: {
      main: "#2E7D32"
    },
    warning: {
      main: "#F4A259"       // warm accent orange
    },
    info: {
      main: "#0288D1"       // info blue
    },
    text: {
      primary: "#1E293B",   // near-black for readability
      secondary: "#475569"  // muted gray for less important text
    }
  },
  typography: {
    fontFamily: "Lato, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: "0.5px"
    },
    subtitle1: {
      opacity: 0.8,
      fontWeight: 300
    }
  },
  shape: {
    borderRadius: 10
  },
  shadows: [
    "none",
    "0px 1px 4px rgba(0,0,0,0.1)",   // subtle shadow
    "0px 3px 6px rgba(0,0,0,0.15)",  // medium
    "0px 6px 12px rgba(0,0,0,0.2)",  // strong
    ...Array(22).fill("none")        // fill remaining slots
  ],
  components: {
    MuiIconButton: {
      defaultProps: {
        size: "small"
      },
      styleOverrides: {
        root: {
          "&.delete-btn": {
            color: "#E53935",
            "&:hover": { backgroundColor: "rgba(229,57,53,0.1)" }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 6px 12px rgba(0,0,0,0.15)"
          }
        }
      }
    },
    MuiSnackbarContent: {
      styleOverrides: {
        message: {
          fontWeight: 600,
          textTransform: "capitalize"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(25, 118, 210, 0.2)"
            },
            "&:hover fieldset": {
              borderColor: "rgba(25, 118, 210, 0.4)"
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  },
  // 🎨 Custom page effects
  customPages: {
    dashboard: {
      bg: "linear-gradient(135deg, #63A4FF 0%, #1976D2 100%)",
      accent: "#FFFFFF",
      animation: "fadeIn 0.8s ease-in-out"
    },
    tasks: {
      bg: "linear-gradient(135deg, #56B4D3 0%, #8ABEB7 100%)",
      accent: "#1E293B",
      animation: "slideUp 0.8s ease-in-out"
    },
    reports: {
      bg: "linear-gradient(135deg, #F4A259 0%, #E53935 100%)",
      accent: "#FFFFFF",
      animation: "fadeInScale 0.8s ease-in-out"
    },
    settings: {
      bg: "linear-gradient(135deg, #C1C8E4 0%, #4F6D7A 100%)",
      accent: "#1E293B",
      animation: "slideRight 0.8s ease-in-out"
    }
  }
});

// Enable responsive typography
theme = responsiveFontSizes(theme);

// Add custom keyframes for animations
theme = {
  ...theme,
  customAnimations: {
    "@keyframes fadeIn": {
      "0%": { opacity: 0 },
      "100%": { opacity: 1 }
    },
    "@keyframes slideUp": {
      "0%": { transform: "translateY(20px)", opacity: 0 },
      "100%": { transform: "translateY(0)", opacity: 1 }
    },
    "@keyframes fadeInScale": {
      "0%": { transform: "scale(0.9)", opacity: 0 },
      "100%": { transform: "scale(1)", opacity: 1 }
    },
    "@keyframes slideRight": {
      "0%": { transform: "translateX(-20px)", opacity: 0 },
      "100%": { transform: "translateX(0)", opacity: 1 }
    }
  }
};

export default theme;

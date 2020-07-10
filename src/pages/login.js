import React, { Component } from 'react';
import styled from 'styled-components';
import { auth, signIn, signUp } from '@firebase-api'
import { mixins, Main, Title, theme } from '@styles';
import { 
  Avatar,
  Box,
  Button,
  Checkbox,
  Container, 
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
const _ = require('lodash');

const { colors, } = theme;


const muitheme = createMuiTheme({
  palette: {
    primary: {
      main: colors.accent
    },
  },
});

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © Howard Tseng '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

class LoginPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      signUp: false,
      error: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  }

  validate = () => {
    if (!this.state.email) {
      this.setState({
        error: 'Email address is required'
      });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      this.setState({
        error: 'Email address is invalid'
      });
      return false;
    }
    if (!this.state.password) {
      this.setState({
        error: 'Password is required'
      });
      return false;
    }
    if (this.state.signUp && this.state.password !== this.state.confirmPassword) {
      this.setState({
        error: 'Passwords do not match'
      });
      return false;
    }
    this.setState({
      error: ''
    });
    return true;
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  submitSignIn = async (e) => {
    e.preventDefault();
    let valid = this.validate();
    if(valid) {
      let e = await signIn(this.state.email, this.state.password);
      console.log(e);
      if(e.length !== 0) {
        this.setState({
          error: e
        });
      }
    }
  }
  submitSignUp = async (e) => {
    e.preventDefault();
    let valid = this.validate();
    if(valid) {
      let e = await signUp(this.state.email, this.state.password);
      console.log(e);
      if(e.length !== 0) {
        this.setState({
          error: e
        });
      }
    }
  }

  SignIn = (props) => {
    const classes = props.classes;

    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form 
            className={classes.form} 
            onSubmit={this.submitSignIn}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={this.state.email}
              onChange={this.handleInputChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <Link variant="body2" color='secondary' onClick={() => 
                  this.setState({
                    email: '',
                    password: '',
                  })
                }>
                  {this.state.error}
                </Link>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item>
                <Link variant="body2" onClick={() => this.setState({signUp: true})}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    );
  }

  SignUp = (props) => {
    const classes = props.classes;

    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form 
            className={classes.form} 
            onSubmit={this.submitSignUp}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={this.state.email}
              onChange={this.handleInputChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              value={this.state.confirmPassword}
              onChange={this.handleInputChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container>
              <Grid item>
                <Link variant="body2" color='secondary' onClick={() => 
                  this.setState({
                    email: '',
                    password: '',
                    confirmPassword: '',
                  })
                }>
                  {this.state.error}
                </Link>
              </Grid>
            </Grid>
            <Grid container justify="flex-end">
              <Grid item>
                <Link hvariant="body2" onClick={() => this.setState({signUp: false})}>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Container>
    );
  }

  render() {
    const classes = this.props.classes;
    return (
      <ThemeProvider theme={muitheme}>
        {!this.state.signUp && (
          <this.SignIn classes={classes}/>
        )}
        {this.state.signUp && (
          <this.SignUp classes={classes} />
        )}
      </ThemeProvider>
    );
  }
}
 
export default () => {
  const classes = useStyles();
  return (
    <LoginPage classes={classes} />
  )
}
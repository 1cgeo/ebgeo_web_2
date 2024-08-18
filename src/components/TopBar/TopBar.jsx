import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => (
  <AppBar position="static" className="top-bar">
    <Toolbar>
      <Box className="logo-container">
        <Link to="https://geoportal.eb.mil.br/portal/" target="_blank">
          <img src="/images/dsg_symbol.svg" alt="DSG Symbol" className="logo" />
        </Link>
        <Typography variant="h6" className="title">
          <span className="eb">EB</span>
          <span className="geo">GEO</span>
        </Typography>
      </Box>
      <Box className="bar-center-buttons">
        <Button component={Link} to="/" className="button icon-button">
          <img src="/images/icon_sig.svg" alt="SIG" />
        </Button>
        <Button component={Link} to="/3d" className="button icon-button">
          <img src="/images/icon_3d.svg" alt="3D" />
        </Button>
      </Box>
      <Button className="extra-bar-buttons">Tutorial</Button>
    </Toolbar>
  </AppBar>
);

export default TopBar;
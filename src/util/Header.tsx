import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FaceIcon from '@mui/icons-material/Face';
import { Link } from 'react-router-dom';
import { Grid } from '@mui/material';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <AppBar position="static">
      <Grid container lg={10} justifyContent='left'>
        <Grid item lg={2} justifyContent='start'>
            <Typography
              variant="h4"
              noWrap
              sx={{
                mr: 0,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <FaceIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize:40 }} />
              {title}
            </Typography>
        </Grid>
        <Grid item lg={1}>
          <Button
            component = {Link}
            to = '/'
            sx={{ my: 1, color: 'white', display: 'flex', fontFamily:'Lato', textTransform: 'none' }}
          >
            Real-Time
          </Button>
        </Grid>
        <Grid item lg={1}>
          <Button
            component = {Link}
            to = '/image-detect'
            sx={{ my: 1, color: 'white', display: 'flex', fontFamily:'Lato', textTransform: 'none' }}
          >
            Image
          </Button>
        </Grid>
        <Grid item lg={1}>
          <Button
            component = {Link}
            to = '/train-model'
            sx={{ my: 1, color: 'white', display: 'flex', fontFamily:'Lato', textTransform: 'none' }}
          >
            Train AI
          </Button>
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default Header;

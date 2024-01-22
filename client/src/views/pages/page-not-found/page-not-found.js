// material-ui
import { Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| ACCESS DENIED PAGE ||============================== //

const PageNotFound = () => (
  <MainCard title="Page Not Found">
    <Typography variant="body2">
        Sorry, the page you are looking for does not exist.
    </Typography>
  </MainCard>
);

export default PageNotFound;

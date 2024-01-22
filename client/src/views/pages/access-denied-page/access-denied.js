// material-ui
import { Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| ACCESS DENIED PAGE ||============================== //

const AccessDeniedPage = () => (
  <MainCard title="Access Denied">
    <Typography variant="body2">
      Sorry, you do not have the necessary permissions to access this page. Please contact your administrator for assistance.
    </Typography>
  </MainCard>
);

export default AccessDeniedPage;

import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle, Lock as LockIcon, Email as EmailIcon, MergeType as MergeTypeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';

export default function UserForm() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + `api/user_types`);
      const data = await res.json();
      setUserTypes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(config.apiUrl + `api/users/${userId}`);
      const userData = await res.json();

      // Set user data in the state
      setUserData(userData);

      // Set selected user type using the mapping
      setSelectedUserType(userData.user_type);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map selectedUserType from ID to Name
    const mappedUserType = userTypes.find((userType) => userType._id === selectedUserType)?.name || '';

    const formData = {
      name: e.target.name.value,
      password: e.target.password.value,
      email: e.target.email.value,
      user_type: mappedUserType
    };

    try {
      const apiUrl = userId ? config.apiUrl + `api/users/${userId}` : config.apiUrl + 'api/users/add-new';

      const res = await fetch(apiUrl, {
        // if update method should be put if add new method should be post
        method: userId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // navigate to view users page
      navigate('/app/users');

      console.log('Server response:', await res.json());
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <MainCard title={userId ? 'Update User' : 'Add New User'}>
        <form onSubmit={handleSubmit}>
          <Grid container direction="column" justifyContent="center">
            <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
              {(!userId || (Object.keys(userData).length > 0 && !loading)) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Name
                    </Typography>
                    <TextField
                      fullWidth
                      disabled={userId ? true : false}
                      margin="normal"
                      name="name"
                      type="text"
                      defaultValue={userData.name || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="password"
                      type="password"
                      disabled={userId ? true : false}
                      defaultValue={userData.password || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="email"
                      type="email"
                      disabled={userId ? true : false}
                      defaultValue={userData.email || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      User Type
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="userType"
                      select
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MergeTypeIcon />
                          </InputAdornment>
                        )
                      }}
                    >
                      <MenuItem value="">Select User Type</MenuItem>
                      {userTypes.map((userType) => (
                        <MenuItem key={userType._id} value={userType._id}>
                          {userType.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
            </Grid>
            <Divider sx={{ mt: 3, mb: 2 }} />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" type="submit">
                {userId ? 'Update User' : 'Add User'}
              </Button>
            </CardActions>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}

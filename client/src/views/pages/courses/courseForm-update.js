import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import config from '../../../config';
import CodeIcon from '@mui/icons-material/Code';

export default function CourseForm() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const [courseData, setCourseData] = useState({
    name: '',
    description: '',
    code: ''
  });

  // Fetch course data for update if courseId is available
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (courseId) {
          const res = await fetch(config.apiUrl + `api/courses/${courseId}`);
          const data = await res.json();
          setCourseData(data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: e.target.name.value,
      description: e.target.description.value,
      code: e.target.code.value
    };
    console.log(formData)

    try {
      const url = courseId ? config.apiUrl + `api/course-form-update/${courseId}` : config.apiUrl + 'api/course-form-add-new';

      const method = courseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Server response:', await res.json());

      navigate('/app/courses');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <MainCard title={courseId ? 'Update Course' : 'Add New Course'}>
        <form onSubmit={handleSubmit}>
          <Grid container direction="column" justifyContent="center">
            <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">
                  Name
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  name="name"
                  type="text"
                  value={courseData.name}
                  onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}></Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">
                  Course Code
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  name="code"
                  type="text"
                  value={courseData.course_code}
                  onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" component="h5">
                  Description
                </Typography>
                <TextareaAutosize
                  minRows={8}
                  fullWidth
                  style={{ width: '100%' }}
                  margin="normal"
                  name="description"
                  type="text"
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Divider />
            </Grid>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" type="submit">
                {courseId ? 'Update Course' : 'Add Course'}
              </Button>
            </CardActions>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}

import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { useMediaQuery, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import config from '../../../config';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';

export default function ViewCourses() {
  const [courseData, setCourseData] = useState([]);
  // const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle search
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    // setSearchTerm(term);

    // Filter the courseData based on the search term
    const filteredCourses = courseData.filter((course) => course.name.toLowerCase().includes(term));
    setFilteredData(filteredCourses);
  };

  //fetch course details

  async function fetchCourseDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/courses');
      const allCourses = await response.json();

      // Filter courses where status is true
      const filteredCourses = allCourses.filter((course) => course.status === true);

      // Apply transformation to each course in filteredCourses
      const formattedData = filteredCourses.map((course) => ({ id: course._id, ...course }));

      setCourseData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  console.log(courseData);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const columns = [
    { field: 'name', headerName: 'Course Name', flex: 1.5 },

    { field: 'description', headerName: 'Course Description', flex: 3 },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <>
          <IconButton style={{ backgroundColor: 'white' }}>
            <ModeIcon
              onClick={() => {
                updateCourse(params.row._id);
              }}
              style={{ color: 'gray' }}
            />
          </IconButton>

          <IconButton style={{ margin: 10, backgroundColor: 'white' }}>
            <DeleteIcon style={{ color: 'gray' }} />
          </IconButton>
        </>
      )
    }
  ];

  function updateCourse(courseId) {
    console.log('clicked user id', courseId);
    navigate('/app/courses/update?id=' + courseId);
  }

  return (
    <>
      <MainCard title="View Courses">
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            <Grid item xs={8} sm={5}>
              <Typography variant="h5" component="h5">
                Search
              </Typography>
              <TextField
                fullWidth
                // label="First Name"
                margin="normal"
                name="course"
                type="text"
                SelectProps={{ native: true }}
                defaultValue=""
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                onChange={handleSearch} // Call handleSearch on input change
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredData.length > 0 ? filteredData : courseData} // Use filteredData if available, else use courseData
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 }
                    }
                  }}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}

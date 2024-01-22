import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { InputAdornment, TextField, useMediaQuery, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid-premium';
import FacebookIcon from '@mui/icons-material/Facebook';
import TimelineIcon from '@mui/icons-material/Timeline';
import MonitorIcon from '@mui/icons-material/Monitor';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/useAuthContext';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import config from '../../../config';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function ViewLeads() {
  const { user } = useAuthContext();
  const { permissions } = user || {};
  const { userType } = user || {};
  const navigate = useNavigate();
  // const { id } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const iconComponentMap = {
    facebook: <FacebookIcon color="primary" style={{ color: 'blue' }} />,
    manual: <MonitorIcon color="primary" style={{ color: 'green' }} />,
    internal: <TimelineIcon color="primary" style={{ color: 'orange' }} />
  };
  const [courses, setCourses] = useState([]);
  const [source, setSources] = useState([]);
  const [allLeads, setAllLeads] = useState([]);

  const [selectedCourse, setselectedCourse] = useState('');
  const [selectedSource, setselectedSource] = useState('');
  const [dataeFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sname, setSname] = useState('');
  const [loading, setLoading] = useState(true);

  const [counselors, setCounselors] = useState([]);

  const isAdminOrSupervisor = ['admin', 'sup_admin', 'gen_supervisor'].includes(userType?.name);

  const columns = [
    { field: 'name', headerName: 'Student Name', width: 200 },
    { field: 'source', headerName: 'Source', width: 150, renderCell: (params) => iconComponentMap[params.row.source] },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'scheduled_to', headerName: 'Scheduled To', width: 200 },
    {
      field: 'course',
      headerName: 'Course',
      width: 250
    },
    {
      field: 'branch',
      headerName: 'Branch',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 150
    },
    {
      field: 'counsellor',
      headerName: 'Assign To',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 250,
      align: 'left',
      renderCell: (params) => {
        if (isAdminOrSupervisor) {
          return (
            <>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={counselors}
                sx={{ width: 200, my: 2 }}
                renderInput={(params) => <TextField {...params} label="Choose a counsellor" variant="standard" />}
                value={params.row.counsellor}
                onChange={(event, newValue) => {
                  // Handle the selection here
                  console.log('cid1', params.row.counsellor);
                  console.log('cid', newValue.label);
                  console.log('lid', params.row.id);
                  const lid = params.row.id;
                  const cid = newValue.id;
                  params.row.counsellor = newValue.label;

                  const updateLead = async () => {
                    try {
                      const updateLead = await fetch(config.apiUrl + `api/leads/${lid}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          counsellor_id: cid
                        })
                      });
                      if (!updateLead.ok) {
                        console.error('Error updating lead data', updateLead.statusText);
                        return;
                      } else {
                        console.log(newValue.label);
                        console.log('Successfully assigned');
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  };
                  updateLead();
                }}
              />
            </>
          );
        } else {
          // For other users, display "Assigned to Me" or relevant content
          return <>{params.row.counsellor ? `Assigned to ${params.row.counsellor}` : 'Pending'}</>;
        }
      }
    },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              updateLead(params.row.id);
            }}
            style={{ backgroundColor: 'white' }}
          >
            <ModeIcon style={{ color: 'gray' }} />
          </IconButton>
          <IconButton style={{ margin: 10, backgroundColor: 'white' }}>
            <DeleteIcon style={{ color: 'gray' }} />
          </IconButton>
        </>
      )
    }
  ];

  function updateLead(leadId) {
    console.log('clicked lead id', leadId);
    navigate('/app/leads/update?id=' + leadId);
  }

  useEffect(() => {
    async function fetchLeads() {
      try {
        const apiUrl = config.apiUrl + 'api/leads-details';
        const res = await fetch(apiUrl);

        if (!res.ok) {
          console.error('Error fetching leads data', res.statusText);
          return;
        }

        const leads = await res.json();

        // Assuming that the backend response is an array of leads
        // Filter leads based on the counselor ID from the backend response
        if (permissions?.lead?.includes('read-all')) {
          setData(leads);
          setAllLeads(leads);
          setLoading(false);
          return;
        } else if (permissions?.lead?.includes('read') && userType?.name === 'counselor') {
          const filteredLeads = leads.filter((lead) => lead.counsellor_id === user._id);
          setData(filteredLeads);
          setAllLeads(filteredLeads);
          setLoading(false);
          console.log(filteredLeads); // Log the filtered leads
          return;
        } else if (permissions?.lead?.includes('read') && userType?.name === 'user') {
          const filteredLeads = leads.filter((lead) => lead.user_id === user._id);
          setData(filteredLeads);
          setAllLeads(filteredLeads);
          setLoading(false);
          console.log(filteredLeads);
          return;
        }
      } catch (error) {
        console.log('Error fetching leads:', error);
      }
    }

    fetchLeads();
    const fetchCourses = async () => {
      try {
        const response = await fetch(config.apiUrl + 'api/courses');
        if (response.ok) {
          const json = await response.json();
          setCourses(json);
        } else {
          console.error('Error fetching courses:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching courses:', error.message);
      }
    };
    fetchCourses();
    const fetchSources = async () => {
      try {
        const response = await fetch(config.apiUrl + 'api/source');
        if (response.ok) {
          const json = await response.json();
          setSources(json);
        } else {
          console.error('Error fetching sources:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sources:', error.message);
      }
    };
    fetchSources();
    async function getCounselors() {
      try {
        const res = await fetch(config.apiUrl + 'api/getCounsellors');
        const data = await res.json();
        setCounselors(data);
      } catch (error) {
        console.log('Error fetching counselors:', error);
      }
    }
    getCounselors();
  }, []);

  const sortDateFrom = (datefrom) => {
    const sortedLeads = allLeads.filter((lead) => lead.date >= datefrom);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortDateTo = (dateto) => {
    const sortedLeads = allLeads.filter((lead) => lead.date <= dateto);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortSources = (source) => {
    const sortedLeads = allLeads.filter((lead) => lead.source === source);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortName = (name) => {
    const sortedLeads = allLeads.filter((lead) => lead.name.toLowerCase().includes(name.toLowerCase()));
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const sortCourses = (course) => {
    const sortedLeads = allLeads.filter((lead) => lead.course === course);
    setData(sortedLeads);
    console.log(sortedLeads);
  };

  const [data, setData] = useState([]);

  return (
    <>
      <MainCard title="View Leads">
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            <Grid container direction="column">
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
                    value={sname}
                    onChange={(event) => {
                      setSname(event.target.value);
                      sortName(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={8} sm={5}></Grid>
                <Grid item xs={8} sm={3}>
                  <Typography variant="h5" component="h5">
                    Course
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="course"
                    select
                    SelectProps={{ native: true }}
                    value={selectedCourse}
                    onChange={(event) => {
                      setselectedCourse(event.target.value);
                      console.log(event.target.value);
                      sortCourses(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled>
                      Select Course
                    </option>
                    {courses && courses.length > 0 ? (
                      courses.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Courses available
                      </option>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={8} sm={3}>
                  <Typography variant="h5" component="h5">
                    Source
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="media"
                    select
                    SelectProps={{ native: true }}
                    value={selectedSource}
                    onChange={(event) => {
                      setselectedSource(event.target.value);
                      sortSources(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InsertLinkIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled>
                      Select Source
                    </option>
                    {source && source.length > 0 ? (
                      source.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Sources available
                      </option>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h5" component="h5">
                    Date From
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="date"
                    type="date"
                    value={dataeFrom}
                    onChange={(event) => {
                      setDateFrom(event.target.value);
                      sortDateFrom(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h5" component="h5">
                    Date To
                  </Typography>
                  <TextField
                    fullWidth
                    // label="First Name"
                    margin="normal"
                    name="date"
                    type="date"
                    value={dateTo}
                    onChange={(event) => {
                      setDateTo(event.target.value);
                      sortDateTo(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={12}>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={data}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 }
                    }
                  }}
                  slots={{
                    toolbar: CustomToolbar
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

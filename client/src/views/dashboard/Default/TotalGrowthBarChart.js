import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography } from '@mui/material';
import config from '../../../config';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import chartData from './chart-data/total-growth-bar-chart';

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart = ({ isLoading }) => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const { navType } = customization;
  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  // const [leadData, setLeadData] = useState([]);
  const [leadsCountByMonth, setLeadsCountByMonth] = useState({});

  //  frech leads details

  async function fetchLeads() {
    try {
      const response = await fetch(config.apiUrl + 'api/leads');
      const leadData = await response.json();

      // Group leads by month
      const groupedLeads = groupLeadsByMonth(leadData);

      // Get the count of leads for each month
      const leadsCountByMonth = getLeadsCountByMonth(groupedLeads);

      // // Do something with the leads count, for example:
      // console.log(leadsCountByMonth);

      // Set the leads count and update state
      setLeadsCountByMonth(leadsCountByMonth);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  function groupLeadsByMonth(leadData) {
    const groupedLeads = {};

    leadData.forEach((lead) => {
      const date = new Date(lead.date);
      const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

      if (!groupedLeads[monthYear]) {
        groupedLeads[monthYear] = [];
      }

      groupedLeads[monthYear].push(lead);
    });

    return groupedLeads;
  }

  function getLeadsCountByMonth(groupedLeads) {
    const leadsCountByMonth = {};

    // Calculate the count of leads for each month
    for (const monthYear in groupedLeads) {
      const leadsCount = groupedLeads[monthYear].length;
      leadsCountByMonth[monthYear] = leadsCount;
    }

    return leadsCountByMonth;
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const newChartData = {
      ...chartData.options,
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: grey200
      },
      tooltip: {
        theme: 'light'
      },
      legend: {
        labels: {
          colors: grey500
        }
      }
    };

    // do not load chart when loading
    if (!isLoading) {
      ApexCharts.exec(`bar-chart`, 'updateOptions', newChartData);
    }
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, darkLight, grey200, isLoading, grey500]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="subtitle2" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>
                        Leads Progress
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item></Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Chart
                height={480}
                type="bar"
                options={{
                  chart: {
                    id: 'bar-chart',
                    stacked: true,
                    toolbar: {
                      show: true
                    },
                    zoom: {
                      enabled: true
                    }
                  },
                  responsive: [
                    {
                      breakpoint: 480,
                      options: {
                        legend: {
                          position: 'bottom',
                          offsetX: -10,
                          offsetY: 0
                        }
                      }
                    }
                  ],
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: '50%'
                    }
                  },
                  xaxis: {
                    type: 'category',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  },
                  legend: {
                    show: true,
                    fontSize: '14px',
                    fontFamily: `'Roboto', sans-serif`,
                    position: 'bottom',
                    offsetX: 20,
                    labels: {
                      useSeriesColors: false
                    },
                    markers: {
                      width: 16,
                      height: 16,
                      radius: 5
                    },
                    itemMargin: {
                      horizontal: 15,
                      vertical: 8
                    }
                  },
                  fill: {
                    type: 'solid'
                  },
                  dataLabels: {
                    enabled: false
                  },
                  grid: {
                    show: true
                  }
                }}
                series={[
                  {
                    name: 'last year',
                    data: [35, 15, 0, 20, 10, 15, 25, 35, 20, 25, 15, 20]
                  },
                  {
                    name: 'This year',
                    data: Object.values(leadsCountByMonth)
                  }
                ]}
              />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;

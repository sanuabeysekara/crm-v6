import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { Button, CardActions, CardContent, Grid, Typography, ListItem, ListItemText } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';
// import config from '../../../config';

// assets
// import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import EarningIcon from 'assets/images/icons/courses.svg';

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const PopularCard = ({ isLoading, products }) => {
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Calculate the start and end index of the products for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Display only the products for the current page
  const displayedProducts = isLoading ? [] : products.slice(startIndex, endIndex);

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                <Grid container alignContent="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Ongoing Courses</Typography>
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ pt: '16px !important' }}>
                <img src={EarningIcon} alt="Notification" />
              </Grid>
              <Grid item xs={12}>
                <Grid container direction="column">
                  {displayedProducts.map((product, index) => {
                    const hasDivider = index < displayedProducts.length - 1;

                    return (
                      <ListItem divider={hasDivider} key={product.id}>
                        <ListItemText
                          primary={product.name}
                          primaryTypographyProps={{ variant: 'subtitle1' }}
                          secondary={product.description}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Button size="small" disableElevation onClick={() => setCurrentPage((prevPage) => prevPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button
              size="small"
              disableElevation
              onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
              disabled={endIndex >= products.length}
            >
              Next
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
};

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  products: PropTypes.array
};

export default PopularCard;

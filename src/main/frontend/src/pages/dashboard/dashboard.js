import React from 'react';
import { Grid, withStyles } from '@material-ui/core';
import Widget from '../../components/Widgets/WidgetView';
import Stats from '../../components/Stats/DashboardStatsController';
import Cases from './caseTable/caseController';
import PositionedSnackbar from '../../components/Disclaimer/DisclaimerView';
import Donut from '../../components/Widgets/PieCharts/Donut/DonutController';
import ProgramSunburst from '../../components/Widgets/PieCharts/ProgramSunburst/ProgramSunburstController';

const Dashboard = ({
  classes, data,
}) => (
  <>
    <Stats />
    <Grid container spacing={32}>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Programs and Studies"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <ProgramSunburst
            data={data.studiesByProgram}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Breed"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <Donut
            data={data.caseCountByBreed}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Diagnosis"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <Donut
            data={data.caseCountByDiagnosis}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
    </Grid>
    {/* second row Grids */}
    <Grid container spacing={32}>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Disease Site"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <Donut
            data={data.caseCountByDiseaseSite}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Sex"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <Donut
            data={data.caseCountByGender}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
      <Grid item lg={4} md={4} sm={6} xs={12}>
        <Widget
          title="Tumor Stage"
          upperTitle
          bodyClass={classes.fullHeightBody}
          className={classes.card}
        >
          <Donut
            data={data.caseCountByStageOfDisease}
            width={400}
            height={200}
            innerRadius={50}
            outerRadius={85}
            cx="50%"
            cy="50%"
          />
        </Widget>
      </Grid>
    </Grid>

    <Cases />
    {/* Addingg diclaimer for Dev */}
    <PositionedSnackbar />
  </>
);

const styles = (theme) => ({
  card: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  paper: {
    textAlign: 'center',
  },
  fakeToolbar: {
    ...theme.mixins.toolbar,
  },
  sunburst: {
    textAlign: 'center',
  },
});

export default withStyles(styles, { withTheme: true })(Dashboard);

/*
 * @Author: your name
 * @Date: 2020-08-11 20:50:43
 * @LastEditTime: 2020-08-12 22:10:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-react-notes\src\App.js
 */
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Search from "./components/Search.jsx";
import FileList from "./components/FileList.jsx";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function AutoGrid() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            {/* 搜索组件 */}
            <Search
              title="我的云笔记"
              handleSearch={(val) => {
                console.log(val);
              }}
            />
            <FileList />
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper className={classes.paper}>xs</Paper>
        </Grid>
      </Grid>
    </div>
  );
}

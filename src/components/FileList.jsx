import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import GTranslateIcon from "@material-ui/icons/GTranslate";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import PropTypes from "prop-types";

const FileList = ({ filesArr, onFileClick, onSavaEdit, handleDelete }) => {
  return (
    <>
      <List component="nav" aria-label="main mailbox folders">
        <ListItem button>
          <ListItemIcon>
            <GTranslateIcon />
          </ListItemIcon>
          <ListItemText primary="hah" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <GTranslateIcon />
          </ListItemIcon>
          <ListItemText primary="hah" />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete">
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </>
  );
};
FileList.propTypes = {
  // filesArr:
};
export default FileList;

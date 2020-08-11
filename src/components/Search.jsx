import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";

import Typography from "@material-ui/core/Typography";
const Search = ({ title, handleSearch }) => {
  const [showInput, setShowinput] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const nodeRef = useRef(null);
  const startSearch = () => {
    console.log(`开始搜索`);
    setShowinput(true);
  };
  const closeSearch = () => {
    console.log(`点击关闭搜索`);
    setShowinput(false);
  };
  const handleIptChange = () => {
    console.log(`输入框`);
  };
  useEffect(() => {
    if (showInput) {
      // 输入框存在点击搜索
      console.log(nodeRef.current);
      nodeRef.current.focus();
    }
  }, [showInput]);
  return (
    <div>
      {!showInput && (
        <>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          <Button variant="contained" onClick={startSearch}>
            搜索
          </Button>
        </>
      )}
      {showInput && (
        <>
          <form noValidate autoComplete="off">
            <Input
              defaultValue="Hello world"
              inputProps={{ "aria-label": "description" }}
              onChange={handleIptChange}
              inputRef={nodeRef}
            />
          </form>
          <Button variant="contained" onClick={closeSearch}>
            关闭
          </Button>
        </>
      )}
    </div>
  );
};
export default Search;

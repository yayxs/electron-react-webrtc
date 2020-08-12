import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
import SearchIcon from "@material-ui/icons/Search";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
const Search = ({ title, handleSearch }) => {
  const [showInput, setShowinput] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const nodeRef = useRef(null);
  const startSearch = () => {
    setShowinput(true);
  };
  const closeSearch = (e) => {
    e.preventDefault();
    setInputVal("");
    setShowinput(false);
  };
  const handleIptChange = ({ target: { value } }) => {
    // setInputVal
    setInputVal(value);
  };

  useEffect(() => {
    const handleEvt = (e) => {
      const { keyCode } = e;
      if (keyCode === 13 && showInput) {
        console.log(inputVal);
        handleSearch(inputVal); // 输入框当前的值
      } else if (keyCode === 27 && showInput) {
        closeSearch(e);
      }
    };

    document.addEventListener("keyup", handleEvt);

    return () => {
      document.removeEventListener("keyup", handleEvt);
    };
  });
  useEffect(() => {
    if (showInput) {
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
            <SearchIcon />
          </Button>
        </>
      )}
      {showInput && (
        <>
          <form noValidate autoComplete="off">
            <Input
              inputProps={{ "aria-label": "description" }}
              onChange={handleIptChange}
              inputRef={nodeRef}
              value={inputVal}
            />
          </form>
          <Button variant="contained" onClick={(e) => closeSearch(e)}>
            <HighlightOffIcon />
          </Button>
        </>
      )}
    </div>
  );
};
Search.propTypes = {
  title: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
};
// 指定 props 的默认值：
Search.defaultProps = {
  title: "云笔记",
};

export default Search;

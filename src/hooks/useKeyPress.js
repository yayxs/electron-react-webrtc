/*
 * @Author: your name
 * @Date: 2020-08-12 22:40:30
 * @LastEditTime: 2020-08-12 22:49:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-react-notes\src\hooks\useKeyPress.js
 */
import { useState, useEffect } from "react";
const useKeyPress = (targetKeyCode) => {
  const [isPress, setIsPress] = useState(false);

  useEffect(() => {
    const handleDown = (e) => {
      if (e.keyCode === targetKeyCode) {
        setIsPress(true);
      }
    };
    const handleUp = (e) => {
      if (e.keyCode === targetKeyCode) {
        setIsPress(false);
      }
    };
    document.addEventListener("keydown", handleDown);
    document.addEventListener("keyup", handleUp);
    return () => {
      document.removeEventListener("keydown", handleDown);
      document.removeEventListener("keyup", handleUp);
    };
  }, [targetKeyCode]);
  return isPress;
};
export default useKeyPress;

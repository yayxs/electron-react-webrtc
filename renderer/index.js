// const fs = require('fs')
const BrowserWindow = require('electron').remote.BrowserWindow
window.onload = ()=>{
    let btn = this.document.querySelector('#btn')
    let con = this.document.querySelector('#con')
    let newWin = null
    // 读取文件
    // btn.onclick = function(){
    //     console.log(`点击了按钮开始读取文件`)
    //     fs.readFile('book.txt',(err,data)=>{
    //         if(err){
    //             console.log(`读取失败`)
    //         }
    //         con.innerHTML = data
    //     })
    // }
    // 打开一个新窗口
    btn.onclick = function(){
        newWin = new BrowserWindow({
            width:400,
            height:400
        })
        newWin.loadFile('test.html',(err,data)=>{
            console.log(err)
        })
        newWin.on('close',()=>{
            newWin = null
        })
    }
}
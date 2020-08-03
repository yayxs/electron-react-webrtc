const { globalShortcut,app} =require('electron')
app.on('ready',()=>{
    globalShortcut.register('ctrl+e',()=>{
        console.log(`ctrl+e`)
    })
})

// globalShortcut str
function isRegister(globalShortcut){
    return globalShortcut.isRegistered(globalShortcut)
}
// 注销全部的快捷键

app.on('will-quit',()=>{
    globalShortcut.unregister('Ctrl+e')
})
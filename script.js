const url = "./list.txt"

const margins = 10;
const resetCONT = `
<div class="containerElem" id="backButton" onclick="back()">
</div>
<div class="containerElem" id="addFolderButton" onclick="newFolder()">
</div>
<div class="containerElem" id="addFile">
    <input class="containerElem" id="addFileButton" multiple value="" type="file" onchange="uploadFile(event)"/>
</div>`;

let request = new XMLHttpRequest();
request.open('GET', url);

var curentPath = './shared'

const IMAGEEXTENSIONS = ['png', 'jpg', 'gif', 'bmp', 'tiff', 'jpeg', 'ico']

function createElement(path, currentPath, isFolder){
    var ext = path.split('.');
    ext = ext[ext.length - 1];
    var a, b, i;
    a = document.createElement("div");
    a.classList += "containerElem ";
    for(i = 0; i < IMAGEEXTENSIONS.length; i++)
        if(ext == IMAGEEXTENSIONS[i]){
            try{
                a.style.backgroundImage = "url(" + "./thumb" + currentPath.substring(1) + '/' + path + ")";
            }catch (error){
                console.log(100); // daca nu exista thumb
            }
            break;
        }
    if(i == IMAGEEXTENSIONS.length){
        if(isFolder)
            a.style.backgroundImage = "url(./thumb/folder.png)";
        else
            a.style.backgroundImage = "url(" + "./thumb/" + ext + ".png)";
        a.classList += "bgAdjust ";
    }
    var c = document.createElement("div"); //buton de stergere
    c.classList = "deleteButton";
    c.innerHTML = "X";

    c.addEventListener('click', (e)=>{
        path = e.originalTarget.parentNode.alt; //delete this
        path = '/r/'+ path;
        fetch(path).then(()=>{
            var rm = e.originalTarget.parentNode;
            rm = rm.parentNode.removeChild(rm);
        });
        
        if(e.stopPropagation)
            e.stopPropagation();
    });

    a.append(c);
    b = document.createElement("div");
    b.classList += "containerText ";
    a.alt = currentPath + '/' + path;
    b.innerHTML = path.replaceAll("%20", ' ');

    a.append(b);
    
    a.addEventListener('click', ()=>{
        if(isFolder)
        changeFolder(path);
        else
        open(curentPath + '/' + path);
    });

    return a;
}

function adjustTextLength(elem){
    var elem = elem.children[1];

    if(elem.clientHeight == elem.scrollHeight)
        return
    else{
        elem.innerHTML += '…';
        while(elem.clientHeight < elem.scrollHeight)
            elem.innerHTML = elem.innerHTML.substring(0, elem.innerHTML.length - 3) + '…';
    }
}

function updateFolderDisplay(){
    var disp = document.getElementById("currentFolder");
    disp.innerHTML = curentPath.replace("./shared", '').replaceAll("%20", ' ') + '/';
}

function changeFolder(path){
    curentPath += '/' + path;
    var cont = document.getElementById('filesContainer');

    updateFolderDisplay();
    getFiles();
}

function back(){
    if(curentPath == './shared') return; 

    var lastPos = curentPath.lastIndexOf('/');
    curentPath = curentPath.substring(0, lastPos);

    updateFolderDisplay();
    getFiles();
}

function computeWidth(){
    var screenWidth = window.innerWidth;
    var cont = document.getElementById('filesContainer');
    var elem = 2 * margins + cont.children[0].offsetWidth;
    var width = 0;

    while(width + elem < screenWidth)
        width += elem;

    cont.style.width = width + 'px';
}

function newFolder(){
    fetch('m/' + curentPath).then(()=>{
        getFiles();
    });
}

function uploadFile(e){
    var input = e.originalTarget;
    var files = input.files;

    for(var i = 0; i < files.length; i++){
        var name = files[i].name;
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[i]);
        fileReader.onload = function () {
            var data = fileReader.result;
            fetch(curentPath + '/' + name, {method: 'POST', body: data}).then(()=>{
                getFiles()
            });
        }; 
    }
    input.value = '';
}

function getFiles(){
    document.getElementById('filesContainer').innerHTML = resetCONT;

    fetch('f/' + curentPath).then(function(response){
        response.text().then((e)=>{
            e = e.split('\n');
            folders = [];
            for(var i = 1; i < e.length; i++){
                var curent = e[i];
            
                var isFolder = !curent.includes('.');

                if(curent == '')
                    continue;
                
                if(isFolder){
                    if(folders.includes(curentPath + '/' +curent))
                        continue;
                    else
                        folders.push(curentPath + '/' +curent);
                }  
                var elem = createElement(curent, curentPath, isFolder);
                document.getElementById('filesContainer').append(elem);
                adjustTextLength(elem);
            }
        });
    });
}

getFiles();
computeWidth();       
window.addEventListener('resize', computeWidth);
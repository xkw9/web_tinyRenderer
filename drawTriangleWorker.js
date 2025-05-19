function draw(renderer, model, id, nworkers, mvp) {

    for (let i = id; i < model.faceCount(); i += nworkers) {
        
        let triangle = model.faces[i].multMatrix(mvp)
        renderer.drawTriangle(triangle ,model);
    }


}

onmessage = function (e) {
    let { renderer, model, id, nworkers, mvp } = e.data;

    draw(renderer, model, id, nworkers, mvp);
    
    postMessage({ id: id });
    
}
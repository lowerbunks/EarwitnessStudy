function create_tv_array(json_object) {
    let tv_array = [];
    for (let i = 0; i < json_object.length; i++) {
        let obj = {};
        obj.stimulus = json_object[i].stimulus;
        tv_array.push(obj);
    }
    return tv_array;
}
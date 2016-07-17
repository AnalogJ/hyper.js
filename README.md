

	var Hyper = require('hyper.js');
	
	var hyper = new Hyper();
	hyper.listImages(function (err, containers) {
		if(err){
			console.log("ERROR:", err)
			return
		}
	
		containers.forEach(function (containerInfo) {
			console.log(containerInfo)
			// docker.getContainer(containerInfo.Id).stop(cb);
		});
	});
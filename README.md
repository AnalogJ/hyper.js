

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
	
	
# Resources

- https://github.com/hyperhq/hypercli
- https://github.com/hyperhq/hypercli/blob/master/vendor/src/github.com/docker/engine-api/client/sign4.go
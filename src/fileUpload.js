<!DOCTYPE html>
<html>

<body>

<input type="file" 
    class="filepond"
    name="filepond" 
    multiple 
    data-allow-reorder="true"
    data-max-file-size="3MB"
    data-max-files="3"></input>
<script src="https://sdk.amazonaws.com/js/aws-sdk-2.250.1.min.js"></script>
<script>

// set up s3 connection
var s3 = new AWS.S3({
    accessKeyId: 'AKIAW2ZDCAUHRXHD4DMF',
    secretAccessKey: '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',
    region: 'us-east-1'
});

// set custom FilePond file processing method
FilePond.setOptions({
    server: {
        process: function(fieldName, file, metadata, load, error, progress, abort) {
            
            s3.upload({
                Bucket: 'hack4reg',
                Key: Date.now() + '_' + file.name,
                Body: file,
                ContentType: file.type,
                ACL: 'public-read'
            }, function(err, data) {

                if (err) {
                    error('Something went wrong');
                    return;
                }

                // pass file unique id back to filepond
                load(data.Key);

            });

        }
    }
});

</script>
 
</body>
</html>
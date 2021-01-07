angular
  .module("testApp", ["risevision.widget.common.storage-selector"])
  .value("fileManagerConfig", {
    contentSource: {
      data: {
        bucketName: "",
        bucketRegion: "us-east-2",
        identityPoolId: "",
      },
      type: "S3_BUCKET",
    },
    cloudinary: { accountName: "" },
    root: "",
    generatedFilesRoot:
      "",
  })
  .controller("TestController", [
    "$scope",
    function ($scope) {
      $scope.$on("picked", function (event, data) {
        alert(data[0]);
      });
    },
  ]);

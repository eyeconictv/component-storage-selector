(function () {
  "use strict";

  angular
    .module("risevision.widget.common.file-selector", [
      "risevision.common.i18n",
      "risevision.widget.common.url-field",
    ])
    .directive("storageSelector", [
      "$templateCache",
      "$log",
      "$window",
      "$rootScope",
      function ($templateCache, $log, $window, $rootScope) {
        return {
          restrict: "E",
          require: "?ngModel",
          scope: {
            title: "@",
            fileManagerConfig: "=",
            fileLabel: "@",
            folderLabel: "@",
            fileType: "@",
            selector: "=",
          },
          template: $templateCache.get(
            "partials/file-selector/dtv-file-selector.html"
          ),
          link: function (scope, element, attrs, ctrl) {
            var fileManager = window.eyeconicFileManager;

            var typeFilter = function (item) {
              console.log("item", item);
              return (
                item.mimeType == null ||
                hasValidExtension(item.url, scope.fileType)
              );
            };

            var propsSingleFile,
              fileManagerSingleInstance,
              propsFolderFile,
              fileManagerFolderInstance;
            scope.fileManagerConfig.onChanged = function () {
              propsSingleFile = Object.assign({}, scope.fileManagerConfig, {
                filterItems: typeFilter,
                selectionType: "file",
                accept: ".gif,.png,.jpg,.jpeg",
                onSelected: function (test) {
                  if (test.mimeType != null) {
                    fileManagerSingleInstance.setOpen(false);
                    scope.selector.selection = "single-file";
                    scope.selector.storageName = test.url;
                    scope.selector.url = test.url;
                    scope.$apply();
                  }
                },
              });

              fileManagerSingleInstance = fileManager.useFileManager(
                propsSingleFile,
                document.getElementById("file-selector")
              );
              propsFolderFile = Object.assign({}, scope.fileManagerConfig, {
                filterItems: typeFilter,
                selectionType: "folder",
                accept: ".gif,.png,.jpg,.jpeg",
                onSelected: function (test) {
                  if (test.mimeType == null) {
                    fileManagerFolderInstance.setOpen(false);
                    scope.selector.selection = "single-folder";
                    scope.selector.storageName = test.identifier;
                    scope.selector.url = test.url;
                    scope.$apply();
                  }
                },
              });
              fileManagerFolderInstance = fileManager.useFileManager(
                propsFolderFile,
                document.getElementById("folder-selector")
              );
            };

            function hasValidExtension(url, fileType) {
              var testUrl = url.toLowerCase(),
                extensions;

              switch (fileType) {
                case "image":
                  extensions = [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".bmp",
                    ".svg",
                    ".gif",
                    ".webp",
                  ];
                  break;
                case "video":
                  extensions = [".webm", ".mp4", ".ogv", ".ogg"];
                  break;
                default:
                  extensions = [];
              }

              for (var i = 0, len = extensions.length; i < len; i++) {
                if (testUrl.indexOf(extensions[i]) !== -1) {
                  return true;
                }
              }

              return false;
            }

            function toggleButtons(selectedType) {
              switch (selectedType) {
                case "single-file":
                  scope.fileBtnSelected = true;
                  scope.folderBtnSelected = false;
                  scope.customBtnSelected = false;
                  break;
                case "single-folder":
                  scope.fileBtnSelected = false;
                  scope.folderBtnSelected = true;
                  scope.customBtnSelected = false;
                  break;
                case "custom":
                  scope.fileBtnSelected = false;
                  scope.folderBtnSelected = false;
                  scope.customBtnSelected = true;
                  break;
                default:
                  scope.fileBtnSelected = false;
                  scope.folderBtnSelected = false;
                  scope.customBtnSelected = false;
                  break;
              }
            }

            function getStorageName(url, type) {
              var str, arr, params, pair, fileName, folder, name;

              if (type === "single-file") {
                // example single storage file url
                // https://storage.googleapis.com/risemedialibrary-abc123/test%2Fvideos%2Ftest.webm

                // get the second part of the split
                str = url.split("storage.googleapis.com/risemedialibrary-")[1];
                // extract everything starting after the company id
                str = decodeURIComponent(str.slice(str.indexOf("/") + 1));
                // split up based on folder separator
                arr = str.split("/");

                // assign the last index of array split as the file name
                fileName = arr.pop();
                // join the remaining array to form the folder name/path
                folder = arr.length > 0 ? arr.join("/") : "";

                if (folder !== "") {
                  // add ending "/" to the folder path
                  folder += "/";
                }

                name = folder + fileName;
              } else if (type === "single-folder") {
                // example single storage folder url
                // https://www.googleapis.com/storage/v1/b/risemedialibrary-abc123/o?prefix=test%2Fvideos%2F

                // everything after "?" will involve the folder name/path
                params = url.split("?");

                for (var i = 0; i < params.length; i++) {
                  // "prefix" will be the param name and the folder name/path will be the value
                  pair = params[i].split("=");

                  if (
                    pair[0] === "prefix" &&
                    typeof pair[1] !== "undefined" &&
                    pair[1] !== ""
                  ) {
                    name = decodeURIComponent(pair[1]);
                    break;
                  }
                }
              }

              return name;
            }

            scope.defaultSetting = {
              selection: "", // "single-file", "single-folder", or "custom"
              storageName: "", // name of file or folder path
              url: "",
            };

            // set default button states
            toggleButtons();

            // default to false so it will set validity on parent to false initially
            scope.selectorValid = false;
            // a flag to check if custom url is in an initial empty state
            scope.customInit = false;
            // default to false so the subscription-status component doesn't show itself until it receives its status
            scope.isSubscribed = true;
            // will hide subscription status permanently if attr was used
            scope.hideSubscription = true;
            // a flag to toggle subscription status visibility (depends on selection type)
            scope.subscriptionOff = true;

            scope.onSingleFileClick = function () {
              fileManagerSingleInstance.setOpen(true);
            };
            scope.onSingleFolderClick = function () {
              fileManagerFolderInstance.setOpen(true);
            };

            scope.defaults = function (obj) {
              if (obj) {
                for (var i = 1, length = arguments.length; i < length; i++) {
                  var source = arguments[i];

                  for (var prop in source) {
                    if (obj[prop] === void 0) {
                      obj[prop] = source[prop];
                    }
                  }
                }
              }
              return obj;
            };

            scope.onCustomBtnHandler = function () {
              scope.selector.selection = "custom";
              scope.selector.url = "";
              scope.selector.storageName = "";
            };

            scope.previewFile = function () {
              $window.open(scope.selector.url, "_blank");
            };

            // scope.$on("picked", function (event, data, type) {
            //   scope.selector.selection = type;
            //   scope.selector.storageName = getStorageName(
            //     data[0],
            //     scope.selector.selection
            //   );
            //   scope.selector.url = data[0];
            // });

            scope.$watch("selectorValid", function (valid) {
              if (ctrl) {
                ctrl.$setValidity("selectorValid", valid);
              }
            });

            scope.$watch("selector", function (selector) {
              scope.defaults(selector, scope.defaultSetting);
            });

            scope.$watch("selector.selection", function (selection) {
              if (typeof selection !== "undefined") {
                toggleButtons(selection);

                scope.subscriptionOff = false;

                if (selection === "single-folder") {
                  // validity is fine when choosing a single-folder from storage
                  scope.selectorValid = true;
                } else if (selection === "custom") {
                  scope.customInit = true;
                  // set selector validity to false to account for allowing an initial empty value for url-field
                  scope.selectorValid = false;
                }

                $rootScope.$broadcast("fileSelectorClick", selection);
              }
            });

            scope.$watch("selector.url", function (url) {
              if (typeof url !== "undefined" && url !== null) {
                if (
                  scope.selector.selection === "single-file" &&
                  typeof scope.fileType !== "undefined"
                ) {
                  // set validity from the single-file storage selection
                  scope.selectorValid = hasValidExtension(url, scope.fileType);
                } else if (
                  scope.selector.selection === "custom" &&
                  scope.customInit &&
                  url !== ""
                ) {
                  // an entry was made in url-field
                  scope.customInit = false;
                  scope.selectorValid = true;
                }
              }
            });
          },
        };
      },
    ]);
})();

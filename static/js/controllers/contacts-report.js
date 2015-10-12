(function () {

  'use strict';

  var inboxControllers = angular.module('inboxControllers');

  inboxControllers.controller('ContactsReportCtrl', 
    ['$scope', '$state', '$log', 'DB', 'Enketo', 'TranslateFrom',
    function ($scope, $state, $log, DB, Enketo, TranslateFrom) {

      var render = function(doc) {
        $scope.setSelected({ doc: doc });
        var instanceData = {};
        if (doc.type === 'person') {
          instanceData.patient_id = doc._id;
        } else {
          instanceData.place_id = doc._id;
        }
        return Enketo
          .render($('#contact-report'), $state.params.formId, instanceData)
          .then(function(form) {
            $scope.form = form;
            $scope.loadingForm = false;
          });
      };

      $scope.save = function() {
        $scope.saving = true;
        Enketo.save($state.params.formId, $scope.form)
          .then(function(doc) {
            $log.debug('saved report', doc);
            $scope.saving = false;
            $state.go('contacts.detail', { id: $state.params.id });
          })
          .catch(function(err) {
            $scope.saving = false;
            $log.error('Error submitting form data: ', err);
          });
      };

      $scope.form = null;
      $scope.loadingForm = true;
      $scope.setActionBar();
      $scope.setShowContent(true);
      DB.get()
        .get($state.params.id)
        .then(render)
        .then(function() {
          return DB.get().query('medic/forms', { include_docs: true, key: $state.params.formId });
        })
        .then(function(res) {
          if (res.rows[0]) {
            $scope.setTitle(TranslateFrom(res.rows[0].doc.title));
          }
        })
        .catch(function(err) {
          $log.error('Error loading form', err);
          $scope.contentError = true;
          $scope.loadingForm = false;
        });

      $scope.$on('$destroy', function() {
        Enketo.unload($scope.form);
      });
    }
  ]);

}());

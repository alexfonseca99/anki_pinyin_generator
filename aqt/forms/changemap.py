# -*- coding: utf-8 -*-
from aqt.utils import tr, TR


# Form implementation generated from reading ui file 'qt/aqt/forms/changemap.ui'
#
# Created by: PyQt5 UI code generator 5.15.2
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_ChangeMap(object):
    def setupUi(self, ChangeMap):
        ChangeMap.setObjectName("ChangeMap")
        ChangeMap.resize(391, 360)
        self.vboxlayout = QtWidgets.QVBoxLayout(ChangeMap)
        self.vboxlayout.setObjectName("vboxlayout")
        self.label = QtWidgets.QLabel(ChangeMap)
        self.label.setWordWrap(True)
        self.label.setObjectName("label")
        self.vboxlayout.addWidget(self.label)
        self.fields = QtWidgets.QListWidget(ChangeMap)
        self.fields.setObjectName("fields")
        self.vboxlayout.addWidget(self.fields)
        self.buttonBox = QtWidgets.QDialogButtonBox(ChangeMap)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.vboxlayout.addWidget(self.buttonBox)

        self.retranslateUi(ChangeMap)
        self.buttonBox.accepted.connect(ChangeMap.accept)
        self.buttonBox.rejected.connect(ChangeMap.reject)
        self.fields.doubleClicked['QModelIndex'].connect(ChangeMap.accept)
        QtCore.QMetaObject.connectSlotsByName(ChangeMap)

    def retranslateUi(self, ChangeMap):
        _translate = QtCore.QCoreApplication.translate
        ChangeMap.setWindowTitle(tr(TR.ACTIONS_IMPORT))
        self.label.setText(tr(TR.BROWSING_TARGET_FIELD))

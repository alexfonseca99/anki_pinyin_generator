# -*- coding: utf-8 -*-
from aqt.utils import tr, TR


# Form implementation generated from reading ui file 'qt/aqt/forms/emptycards.ui'
#
# Created by: PyQt5 UI code generator 5.15.2
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(531, 345)
        Dialog.setWindowTitle("EMPTY_CARDS")
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(Dialog)
        self.verticalLayout_2.setContentsMargins(0, 0, 0, 0)
        self.verticalLayout_2.setSpacing(0)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.webview = AnkiWebView(Dialog)
        self.webview.setProperty("url", QtCore.QUrl("about:blank"))
        self.webview.setObjectName("webview")
        self.verticalLayout_2.addWidget(self.webview)
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setContentsMargins(12, 12, 12, 12)
        self.verticalLayout.setSpacing(12)
        self.verticalLayout.setObjectName("verticalLayout")
        self.keep_notes = QtWidgets.QCheckBox(Dialog)
        self.keep_notes.setText("KEEP_NOTES")
        self.keep_notes.setChecked(True)
        self.keep_notes.setObjectName("keep_notes")
        self.verticalLayout.addWidget(self.keep_notes)
        self.buttonBox = QtWidgets.QDialogButtonBox(Dialog)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Close)
        self.buttonBox.setObjectName("buttonBox")
        self.verticalLayout.addWidget(self.buttonBox)
        self.verticalLayout_2.addLayout(self.verticalLayout)

        self.retranslateUi(Dialog)
        self.buttonBox.accepted.connect(Dialog.accept)
        self.buttonBox.rejected.connect(Dialog.reject)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        pass
from aqt.webview import AnkiWebView

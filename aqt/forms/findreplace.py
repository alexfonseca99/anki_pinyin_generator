# -*- coding: utf-8 -*-
from aqt.utils import tr, TR


# Form implementation generated from reading ui file 'qt/aqt/forms/findreplace.ui'
#
# Created by: PyQt5 UI code generator 5.15.2
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(367, 224)
        self.verticalLayout = QtWidgets.QVBoxLayout(Dialog)
        self.verticalLayout.setObjectName("verticalLayout")
        self.gridLayout = QtWidgets.QGridLayout()
        self.gridLayout.setObjectName("gridLayout")
        self.label = QtWidgets.QLabel(Dialog)
        self.label.setObjectName("label")
        self.gridLayout.addWidget(self.label, 0, 0, 1, 1)
        self.find = QtWidgets.QComboBox(Dialog)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Fixed)
        sizePolicy.setHorizontalStretch(9)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.find.sizePolicy().hasHeightForWidth())
        self.find.setSizePolicy(sizePolicy)
        self.find.setEditable(True)
        self.find.setInsertPolicy(QtWidgets.QComboBox.NoInsert)
        self.find.setSizeAdjustPolicy(QtWidgets.QComboBox.AdjustToMinimumContentsLength)
        self.find.setObjectName("find")
        self.gridLayout.addWidget(self.find, 0, 1, 1, 1)
        self.label_2 = QtWidgets.QLabel(Dialog)
        self.label_2.setObjectName("label_2")
        self.gridLayout.addWidget(self.label_2, 1, 0, 1, 1)
        self.replace = QtWidgets.QComboBox(Dialog)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Fixed)
        sizePolicy.setHorizontalStretch(9)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.replace.sizePolicy().hasHeightForWidth())
        self.replace.setSizePolicy(sizePolicy)
        self.replace.setEditable(True)
        self.replace.setInsertPolicy(QtWidgets.QComboBox.NoInsert)
        self.replace.setSizeAdjustPolicy(QtWidgets.QComboBox.AdjustToMinimumContentsLength)
        self.replace.setObjectName("replace")
        self.gridLayout.addWidget(self.replace, 1, 1, 1, 1)
        self.label_3 = QtWidgets.QLabel(Dialog)
        self.label_3.setObjectName("label_3")
        self.gridLayout.addWidget(self.label_3, 2, 0, 1, 1)
        self.field = QtWidgets.QComboBox(Dialog)
        self.field.setSizeAdjustPolicy(QtWidgets.QComboBox.AdjustToMinimumContentsLength)
        self.field.setObjectName("field")
        self.gridLayout.addWidget(self.field, 2, 1, 1, 1)
        self.re = QtWidgets.QCheckBox(Dialog)
        self.re.setObjectName("re")
        self.gridLayout.addWidget(self.re, 4, 1, 1, 1)
        self.ignoreCase = QtWidgets.QCheckBox(Dialog)
        self.ignoreCase.setChecked(True)
        self.ignoreCase.setObjectName("ignoreCase")
        self.gridLayout.addWidget(self.ignoreCase, 3, 1, 1, 1)
        self.verticalLayout.addLayout(self.gridLayout)
        spacerItem = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout.addItem(spacerItem)
        self.buttonBox = QtWidgets.QDialogButtonBox(Dialog)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Help|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.verticalLayout.addWidget(self.buttonBox)

        self.retranslateUi(Dialog)
        self.buttonBox.accepted.connect(Dialog.accept)
        self.buttonBox.rejected.connect(Dialog.reject)
        QtCore.QMetaObject.connectSlotsByName(Dialog)
        Dialog.setTabOrder(self.find, self.replace)
        Dialog.setTabOrder(self.replace, self.field)
        Dialog.setTabOrder(self.field, self.ignoreCase)
        Dialog.setTabOrder(self.ignoreCase, self.re)
        Dialog.setTabOrder(self.re, self.buttonBox)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(tr(TR.BROWSING_FIND_AND_REPLACE))
        self.label.setText(tr(TR.BROWSING_FIND))
        self.label_2.setText(tr(TR.BROWSING_REPLACE_WITH))
        self.label_3.setText(tr(TR.BROWSING_IN))
        self.re.setText(tr(TR.BROWSING_TREAT_INPUT_AS_REGULAR_EXPRESSION))
        self.ignoreCase.setText(tr(TR.BROWSING_IGNORE_CASE))

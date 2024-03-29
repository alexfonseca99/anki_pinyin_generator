# -*- coding: utf-8 -*-
from aqt.utils import tr, TR


# Form implementation generated from reading ui file 'qt/aqt/forms/template.ui'
#
# Created by: PyQt5 UI code generator 5.15.2
#
# WARNING: Any manual changes made to this file will be lost when pyuic5 is
# run again.  Do not edit this file unless you know what you are doing.


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_Form(object):
    def setupUi(self, Form):
        Form.setObjectName("Form")
        Form.resize(786, 1081)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Preferred)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(Form.sizePolicy().hasHeightForWidth())
        Form.setSizePolicy(sizePolicy)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(Form)
        self.verticalLayout_2.setContentsMargins(0, 0, 0, 0)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.groupBox = QtWidgets.QGroupBox(Form)
        self.groupBox.setTitle("GroupBox")
        self.groupBox.setObjectName("groupBox")
        self.verticalLayout = QtWidgets.QVBoxLayout(self.groupBox)
        self.verticalLayout.setContentsMargins(12, 12, 12, 12)
        self.verticalLayout.setObjectName("verticalLayout")
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.front_button = QtWidgets.QRadioButton(self.groupBox)
        self.front_button.setToolTip("")
        self.front_button.setText("FRONT")
        self.front_button.setChecked(True)
        self.front_button.setObjectName("front_button")
        self.horizontalLayout.addWidget(self.front_button)
        self.back_button = QtWidgets.QRadioButton(self.groupBox)
        self.back_button.setToolTip("")
        self.back_button.setText("BACK")
        self.back_button.setObjectName("back_button")
        self.horizontalLayout.addWidget(self.back_button)
        self.style_button = QtWidgets.QRadioButton(self.groupBox)
        self.style_button.setToolTip("")
        self.style_button.setText("STYLE")
        self.style_button.setObjectName("style_button")
        self.horizontalLayout.addWidget(self.style_button)
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout.addItem(spacerItem)
        self.verticalLayout.addLayout(self.horizontalLayout)
        self.search_edit = QtWidgets.QLineEdit(self.groupBox)
        self.search_edit.setObjectName("search_edit")
        self.verticalLayout.addWidget(self.search_edit)
        self.changes_affect_label = QtWidgets.QLabel(self.groupBox)
        self.changes_affect_label.setText("CHANGES_WILL_AFFECT")
        self.changes_affect_label.setWordWrap(True)
        self.changes_affect_label.setObjectName("changes_affect_label")
        self.verticalLayout.addWidget(self.changes_affect_label)
        self.edit_area = QtWidgets.QTextEdit(self.groupBox)
        self.edit_area.setObjectName("edit_area")
        self.verticalLayout.addWidget(self.edit_area)
        self.verticalLayout_2.addWidget(self.groupBox)

        self.retranslateUi(Form)
        QtCore.QMetaObject.connectSlotsByName(Form)

    def retranslateUi(self, Form):
        _translate = QtCore.QCoreApplication.translate
        Form.setWindowTitle(tr(TR.CARD_TEMPLATES_FORM))
from . import icons_rc

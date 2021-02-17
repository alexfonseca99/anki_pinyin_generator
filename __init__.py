import googletrans
from aqt import mw
from aqt.utils import showInfo, getText
from aqt.qt import *

def pinyin_gen():
    #Encontrar ids das cartas. Pode-se mudar a o argumento para filtrar as cartas a encontrar
    licao = getText("Lição:") #Receber input
    filter = "tag:licao" + str(licao[0])
    showInfo("%s" % filter)
    cids = mw.col.find_cards(filter)

    #Arranjar os caracteres na parte da frente da carta
    caracteres = [mw.col.getCard(cids[i]).q().split("</style>")[1] for i in range(len(cids))]


    #Guardava as traduções que já tinham sido feitas. Inútil quando se adicionam novas cartas
    """
    traducoes = [mw.col.getCard(cids[i]).a().split("<hr id=answer>\n\n")[1] for i in range(len(cids))]
    for i in range(len(caracteres)):
        caracteres[i] = caracteres[i].replace("&nbsp; /&nbsp; ", " / ") #por alguma razão as barras estão encoded
        traducoes[i] = traducoes[i].replace("&nbsp; -&nbsp; ", "  -  ") #o mesmo para os hifen
        traducoes[i] = traducoes[i].replace("&nbsp;", "") # e os espaços também
        if len(traducoes[i].split("-")) == 2:
            traducoes[i] = traducoes[i].split("-")[1] #guardar as liçoes que já estavam traduzidas
    """

    # Editar as cartas
    Translator = googletrans.Translator()
    for i in range(len(caracteres)):
        traducao_cn = Translator.translate(caracteres[i], dest="zh-cn", src="zh-cn")
        traducao_pt = Translator.translate(caracteres[i], dest="pt", src="zh-cn")
        pinyin = traducao_cn.pronunciation.lower()
        card = mw.col.getCard(cids[i])
        note = card.note()
        note["Back"] = pinyin + "  -  " + traducao_pt.text.lower()
        note.flush()
    showInfo("Sucesso!")
    #mw.reset()

action = QAction("Pinyin generator", mw)
qconnect(action.triggered, pinyin_gen)
mw.form.menuTools.addAction(action)
package br.com.buszapp.mobile.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import br.com.buszapp.mobile.MainActivity
import br.com.buszapp.mobile.R
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Calendar
import java.util.Locale

/**
 * Widget da tela inicial: saldo do cartão e próximo ônibus da linha favorita.
 *
 * O app (JS) grava os dados com BuszappWidgetModule.atualizar(json):
 *   { "saldo": 12.5, "linha": { "numero": "7", "nome": "Centro - Efapi" },
 *     "horarios": ["06:00", "07:30"], "atualizadoEm": "21:40" }
 * O widget não acessa a internet: o "próximo ônibus" é calculado aqui, a cada
 * atualização do sistema (30 min) ou quando o app manda dados novos.
 */
class BuszappWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) {
      manager.updateAppWidget(id, montar(context))
    }
  }

  companion object {
    const val PREFS = "buszapp_widget"
    const val CHAVE = "dados"

    fun atualizarTodos(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val ids = manager.getAppWidgetIds(ComponentName(context, BuszappWidgetProvider::class.java))
      if (ids.isNotEmpty()) {
        val views = montar(context)
        for (id in ids) manager.updateAppWidget(id, views)
      }
    }

    /** "HH:MM" do próximo horário a partir de agora, ou null se acabaram os do dia */
    fun proximoHorario(horarios: List<String>, agora: Calendar = Calendar.getInstance()): String? {
      val minutosAgora = agora.get(Calendar.HOUR_OF_DAY) * 60 + agora.get(Calendar.MINUTE)
      return horarios
        .mapNotNull { h ->
          val partes = h.split(":")
          if (partes.size == 2) partes[0].toIntOrNull()?.let { hh -> partes[1].toIntOrNull()?.let { mm -> h to hh * 60 + mm } } else null
        }
        .sortedBy { it.second }
        .firstOrNull { it.second >= minutosAgora }
        ?.first
    }

    private fun montar(context: Context): RemoteViews {
      val views = RemoteViews(context.packageName, R.layout.widget_buszapp)
      val bruto = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(CHAVE, null)

      // tocar no widget abre o app
      val abrir = Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
      val pendente = PendingIntent.getActivity(
        context, 0, abrir, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
      views.setOnClickPendingIntent(R.id.widget_raiz, pendente)

      if (bruto == null) {
        views.setTextViewText(R.id.widget_saldo, "—")
        views.setTextViewText(R.id.widget_linha, "Abra o BusZapp para carregar")
        views.setViewVisibility(R.id.widget_proximo, View.GONE)
        views.setTextViewText(R.id.widget_rodape, "")
        return views
      }

      try {
        val dados = JSONObject(bruto)
        val moeda = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR"))
        views.setTextViewText(
          R.id.widget_saldo,
          if (dados.isNull("saldo")) "Sem cartão" else moeda.format(dados.getDouble("saldo")),
        )

        val linha = dados.optJSONObject("linha")
        if (linha == null) {
          views.setTextViewText(R.id.widget_linha, "Marque uma linha favorita ★")
          views.setViewVisibility(R.id.widget_proximo, View.GONE)
        } else {
          views.setTextViewText(R.id.widget_linha, "Linha ${linha.optString("numero")} · ${linha.optString("nome")}")
          val lista = dados.optJSONArray("horarios")
          val horarios = (0 until (lista?.length() ?: 0)).map { lista!!.getString(it) }
          val proximo = proximoHorario(horarios)
          views.setViewVisibility(R.id.widget_proximo, View.VISIBLE)
          views.setTextViewText(
            R.id.widget_proximo,
            if (proximo != null) "Próximo ônibus: $proximo" else "Sem mais ônibus hoje",
          )
        }
        views.setTextViewText(R.id.widget_rodape, "Atualizado às ${dados.optString("atualizadoEm", "—")}")
      } catch (e: Exception) {
        views.setTextViewText(R.id.widget_linha, "Abra o BusZapp para atualizar")
      }
      return views
    }
  }
}

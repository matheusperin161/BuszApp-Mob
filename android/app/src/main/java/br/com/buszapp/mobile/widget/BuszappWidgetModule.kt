package br.com.buszapp.mobile.widget

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Ponte JS → widget. No JS: NativeModules.BuszappWidget.atualizar(JSON.stringify(dados)).
 * Grava os dados e redesenha os widgets que estiverem na tela inicial.
 */
class BuszappWidgetModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NOME

  @ReactMethod
  fun atualizar(json: String, promise: Promise) {
    try {
      reactContext
        .getSharedPreferences(BuszappWidgetProvider.PREFS, Context.MODE_PRIVATE)
        .edit()
        .putString(BuszappWidgetProvider.CHAVE, json)
        .apply()
      BuszappWidgetProvider.atualizarTodos(reactContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("widget", e.message, e)
    }
  }

  /** ao sair da conta, o widget volta a pedir para abrir o app */
  @ReactMethod
  fun limpar(promise: Promise) {
    reactContext
      .getSharedPreferences(BuszappWidgetProvider.PREFS, Context.MODE_PRIVATE)
      .edit()
      .remove(BuszappWidgetProvider.CHAVE)
      .apply()
    BuszappWidgetProvider.atualizarTodos(reactContext)
    promise.resolve(true)
  }

  companion object {
    const val NOME = "BuszappWidget"
  }
}

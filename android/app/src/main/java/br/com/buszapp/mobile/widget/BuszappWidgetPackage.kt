package br.com.buszapp.mobile.widget

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** registra o BuszappWidgetModule (módulo "antigo", rodando pela camada de compatibilidade) */
class BuszappWidgetPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == BuszappWidgetModule.NOME) BuszappWidgetModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      BuszappWidgetModule.NOME to ReactModuleInfo(
        BuszappWidgetModule.NOME,
        BuszappWidgetModule::class.java.name,
        false, // canOverrideExistingModule
        false, // needsEagerInit
        false, // isCxxModule
        false, // isTurboModule
      ),
    )
  }
}

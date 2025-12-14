import { StyleEditor } from './StyleEditor';
import { TypographyEditor } from './TypographyEditor';
import { PaddingMarginEditor } from './PaddingMarginEditor';
import { PositionEditor } from './PositionEditor';
import { AlignmentTools } from './AlignmentTools';
import { BlockDimensions } from './BlockDimensions';
import { ResponsiveEditor, ResponsiveStyles, Breakpoint } from './ResponsiveEditor';
import { AnimationSettings } from './AnimationSettings';
import { AnimationType } from './ScrollAnimation';
import { ThemeManager, ThemeMode } from './ThemeManager';
import { ColorPalette } from './ColorPaletteManager';
import { AIAssistant } from './AIAssistant';
import { PaymentIntegrations } from './PaymentIntegrations';
import { CRMIntegrations } from './CRMIntegrations';
import { DatabaseIntegrations } from './DatabaseIntegrations';
import { MessengerIntegrations } from './MessengerIntegrations';
import { AIAssistantIntegrations } from './AIAssistantIntegrations';
import { SupportIntegrations } from './SupportIntegrations';
import { EmailMarketingIntegrations } from './EmailMarketingIntegrations';
import { SMSNotificationsIntegrations } from './SMSNotificationsIntegrations';
import { SocialMediaIntegrations } from './SocialMediaIntegrations';
import { AnalyticsIntegrations } from './AnalyticsIntegrations';
import { CalendarIntegrations } from './CalendarIntegrations';
import { StorageIntegrations } from './StorageIntegrations';
import { APIWebhooksIntegrations } from './APIWebhooksIntegrations';
import { OtherIntegrations } from './OtherIntegrations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface PropertiesPanelProps {
  editingStyles: Record<string, unknown>;
  responsiveStyles?: ResponsiveStyles;
  currentBreakpoint: Breakpoint;
  selectedBlockIds: number[];
  animation?: {
    type?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
  };
  hoverEffects?: {
    scale?: number;
    shadow?: boolean;
    colorChange?: string;
  };
  currentTheme?: ThemeMode;
  currentPalette?: ColorPalette;
  customPalettes?: ColorPalette[];
  currentFontPair?: FontPair;
  customFontPairs?: FontPair[];
  customTypographyStyles?: TypographyStyle[];
  onStylesChange: (styles: Record<string, unknown>) => void;
  onResponsiveStylesChange: (responsiveStyles: ResponsiveStyles) => void;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onAnimationChange?: (animation: { type?: AnimationType; delay?: number; duration?: number; threshold?: number }) => void;
  onHoverEffectsChange?: (effects: { scale?: number; shadow?: boolean; colorChange?: string }) => void;
  onAlign: (alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void;
  onDistribute: (direction: 'horizontal' | 'vertical' | 'spacing') => void;
  onThemeChange?: (theme: ThemeMode) => void;
  onPaletteSelect?: (palette: ColorPalette) => void;
  onPaletteSave?: (palette: ColorPalette) => void;
  onPaletteDelete?: (id: string) => void;
  onFontPairSelect?: (pair: FontPair) => void;
  onFontPairSave?: (pair: FontPair) => void;
  onFontPairDelete?: (id: string) => void;
  onTypographyStyleSelect?: (style: TypographyStyle) => void;
  onTypographyStyleSave?: (style: TypographyStyle) => void;
  onTypographyStyleDelete?: (id: string) => void;
  onApplyTypographyStyle?: (style: TypographyStyle) => void;
  onContentChange?: (content: Record<string, unknown>) => void;
  editingContent?: Record<string, unknown>;
}

import { FontPair } from './FontPairManager';
import { TypographyStyle } from './TypographyStylesManager';

export const PropertiesPanel = ({
  editingStyles,
  responsiveStyles,
  currentBreakpoint,
  selectedBlockIds,
  animation,
  hoverEffects,
  currentTheme,
  currentPalette,
  customPalettes,
  currentFontPair,
  customFontPairs,
  customTypographyStyles,
  onStylesChange,
  onResponsiveStylesChange,
  onBreakpointChange,
  onAnimationChange,
  onHoverEffectsChange,
  onThemeChange,
  onPaletteSelect,
  onPaletteSave,
  onPaletteDelete,
  onFontPairSelect,
  onFontPairSave,
  onFontPairDelete,
  onTypographyStyleSelect,
  onTypographyStyleSave,
  onTypographyStyleDelete,
  onApplyTypographyStyle,
  onApplyThemeToSite,
  onAlign,
  onDistribute
}: PropertiesPanelProps) => {
  const { toast } = useToast();
  
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <Tabs defaultValue="styles" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-9 w-full">
          <TabsTrigger value="styles">Стили</TabsTrigger>
          <TabsTrigger value="responsive">Адаптив</TabsTrigger>
          <TabsTrigger value="animations">Анимации</TabsTrigger>
          <TabsTrigger value="design">Дизайн</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="layout">Макет</TabsTrigger>
        </TabsList>
        <TabsContent value="styles" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4 pr-4">
                <StyleEditor
                  styles={editingStyles}
                  onStylesChange={onStylesChange}
                />
                <div className="border-t pt-4 mt-4">
                  <TypographyEditor
                    styles={editingStyles}
                    onStylesChange={onStylesChange}
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <PaddingMarginEditor
                    styles={editingStyles}
                    onStylesChange={onStylesChange}
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <PositionEditor
                    styles={editingStyles}
                    onStylesChange={onStylesChange}
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <BlockDimensions
                    styles={editingStyles}
                    onStylesChange={onStylesChange}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="responsive" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                <ResponsiveEditor
                  styles={editingStyles}
                  responsiveStyles={responsiveStyles}
                  currentBreakpoint={currentBreakpoint}
                  onStylesChange={onStylesChange}
                  onResponsiveStylesChange={onResponsiveStylesChange}
                  onBreakpointChange={onBreakpointChange}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="animations" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                {onAnimationChange && onHoverEffectsChange && (
                  <AnimationSettings
                    animationType={animation?.type || 'none'}
                    delay={animation?.delay || 0}
                    duration={animation?.duration || 600}
                    threshold={animation?.threshold || 0.1}
                    hoverEffects={hoverEffects || {}}
                    onAnimationTypeChange={(type) => onAnimationChange({ ...animation, type })}
                    onDelayChange={(delay) => onAnimationChange({ ...animation, delay })}
                    onDurationChange={(duration) => onAnimationChange({ ...animation, duration })}
                    onThresholdChange={(threshold) => onAnimationChange({ ...animation, threshold })}
                    onHoverEffectsChange={onHoverEffectsChange}
                  />
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="design" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                {onThemeChange && onPaletteSelect && (
                  <ThemeManager
                    currentTheme={currentTheme || 'light'}
                    currentPalette={currentPalette}
                    customPalettes={customPalettes || []}
                    currentFontPair={currentFontPair}
                    customFontPairs={customFontPairs || []}
                    customTypographyStyles={customTypographyStyles || []}
                    onThemeChange={onThemeChange}
                    onPaletteSelect={onPaletteSelect}
                    onPaletteSave={onPaletteSave}
                    onPaletteDelete={onPaletteDelete}
                    onFontPairSelect={onFontPairSelect}
                    onFontPairSave={onFontPairSave}
                    onFontPairDelete={onFontPairDelete}
                    onTypographyStyleSelect={onTypographyStyleSelect}
                    onTypographyStyleSave={onTypographyStyleSave}
                    onTypographyStyleDelete={onTypographyStyleDelete}
                    onApplyTypographyStyle={onApplyTypographyStyle}
                    onApplyToSite={onApplyThemeToSite}
                  />
                )}
              </div>
            </ScrollArea>
            <div className="border-t pt-4 mt-4">
              <AlignmentTools
                selectedBlockIds={selectedBlockIds}
                onAlign={onAlign}
                onDistribute={onDistribute}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-4 space-y-4 flex-grow overflow-y-auto">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                <AnalyticsIntegrations
                  blockId={selectedBlockIds[0]}
                  onIntegrationChange={(provider, config) => {
                    toast({
                      title: "Интеграция настроена",
                      description: `Сервис аналитики ${provider} настроен`
                    });
                  }}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="integrations" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4 space-y-4">
                <Tabs defaultValue="payments" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="payments">Платежи</TabsTrigger>
                    <TabsTrigger value="crm">CRM</TabsTrigger>
                    <TabsTrigger value="ai-assistants">AI</TabsTrigger>
                    <TabsTrigger value="other">Другое</TabsTrigger>
                  </TabsList>

                  <TabsContent value="payments" className="mt-4">
                    <PaymentIntegrations
                      blockId={selectedBlockIds[0]}
                      onIntegrationChange={(provider, config) => {
                        toast({
                          title: "Интеграция настроена",
                          description: `Платежная система ${provider} настроена`
                        });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="crm" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="pr-4">
                        <CRMIntegrations
                          blockId={selectedBlockIds[0]}
                          onIntegrationChange={(provider, config) => {
                            toast({
                              title: "Интеграция настроена",
                              description: `CRM система ${provider} настроена`
                            });
                          }}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="ai-assistants" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="pr-4">
                        <AIAssistantIntegrations
                          blockId={selectedBlockIds[0]}
                          onIntegrationChange={(provider, config) => {
                            toast({
                              title: "Интеграция настроена",
                              description: `AI ассистент ${provider} настроен`
                            });
                          }}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="other" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="pr-4 space-y-4">
                        <Tabs defaultValue="databases" className="w-full">
                          <TabsList className="grid w-full grid-cols-10">
                            <TabsTrigger value="databases">Базы данных</TabsTrigger>
                            <TabsTrigger value="messengers">Мессенджеры</TabsTrigger>
                            <TabsTrigger value="support">Поддержка</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="sms-notifications">SMS/Push</TabsTrigger>
                            <TabsTrigger value="social">Соцсети</TabsTrigger>
                            <TabsTrigger value="calendar">Календари</TabsTrigger>
                            <TabsTrigger value="storage">Хранилища</TabsTrigger>
                            <TabsTrigger value="api-webhooks">API/Webhooks</TabsTrigger>
                            <TabsTrigger value="other">Другое</TabsTrigger>
                          </TabsList>

                          <TabsContent value="databases" className="mt-4">
                            <DatabaseIntegrations
                              blockId={selectedBlockIds[0]}
                              onIntegrationChange={(provider, config) => {
                                toast({
                                  title: "Интеграция настроена",
                                  description: `База данных ${provider} настроена`
                                });
                              }}
                            />
                          </TabsContent>

                          <TabsContent value="messengers" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <MessengerIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Мессенджер ${provider} настроен`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="support" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <SupportIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Система поддержки ${provider} настроена`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="email" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <EmailMarketingIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Email сервис ${provider} настроен`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="sms-notifications" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <SMSNotificationsIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Сервис уведомлений ${provider} настроен`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="social" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <SocialMediaIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Социальная сеть ${provider} настроена`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="calendar" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <CalendarIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Календарь ${provider} настроен`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="storage" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <StorageIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `Хранилище ${provider} настроено`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="api-webhooks" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <APIWebhooksIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `${provider} настроен`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="other" className="mt-4">
                            <ScrollArea className="h-[calc(100vh-200px)]">
                              <div className="pr-4">
                                <OtherIntegrations
                                  blockId={selectedBlockIds[0]}
                                  onIntegrationChange={(provider, config) => {
                                    toast({
                                      title: "Интеграция настроена",
                                      description: `${provider} настроена`
                                    });
                                  }}
                                />
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                <AIAssistant
                  blockType={editingContent.type as string}
                  blockContent={editingContent}
                  blockStyles={editingStyles}
                  onContentGenerated={(content) => {
                    onContentChange({ ...editingContent, text: content });
                  }}
                  onImageSuggestion={(description) => {
                    onContentChange({ ...editingContent, imageDescription: description });
                  }}
                  onDesignSuggestion={(suggestion) => {
                    toast({
                      title: "Предложение по дизайну",
                      description: suggestion.substring(0, 100) + '...'
                    });
                  }}
                  onSEOSuggestion={(suggestion) => {
                    toast({
                      title: "SEO предложение",
                      description: suggestion.substring(0, 100) + '...'
                    });
                  }}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="content" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                <p className="text-sm text-muted-foreground">Редактирование контента блока</p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="layout" className="p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="pr-4">
                <p className="text-sm text-muted-foreground">Настройки макета блока</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
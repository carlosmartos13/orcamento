import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { FormData } from '../types';
import { PricingData } from '../hooks/usePricing';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { calculateMonthlyTotal, calculateEquipmentTotal } from '../utils/calculations';
import { equipmentImages } from '../assets/images';
import modul from '../data/pricing.json';




 Font.register({
   family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
 });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // HEADER STYLES
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #e0e0e0',
  },
  headerText: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#061349',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  logo: {
    width: 110,
    height: 90,
    objectFit: 'contain',
    marginTop: -30,
    paddingTop: 0,
  },

  // SECTION STYLES
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    border: '1 solid #e0e0e0',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#061349',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // TABLE STYLES
  table: {
    Display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableCol1: { width: '50%' },
  tableCol2: { width: '15%', textAlign: 'center' },
  tableCol3: { width: '20%', textAlign: 'right' },
  tableCol4: { width: '15%', textAlign: 'right' },
  
  // CLIENT INFO STYLES
  clientGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientColumn: {
    flex: 1,
    paddingRight: 10,
  },
  clientInfo: {
    marginBottom: 4,
    fontSize: 9,
  },
  
  // TOTAL STYLES
  totalBox: {
    backgroundColor: '#e8f4fd',
    border: '2 solid #1976d2',
    borderRadius: 4,
    padding: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  
  // EQUIPMENT GRID STYLES
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  equipmentItem: {
    width: '23%',
    margin: '1%',
    border: '1 solid #e0e0e0',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fafafa',
    minHeight: 120,
  },
  equipmentImage: {
    width: 60,
    height: 45,
    objectFit: 'contain',
    marginBottom: 5,
    alignSelf: 'center',
  },
  equipmentName: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  equipmentDetails: {
    fontSize: 6,
    color: '#666666',
    textAlign: 'center',
  },

 
  // FINANCIAL SUMMARY STYLES
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  financialCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 4,
    textAlign: 'center',
    minHeight: 60,
  },
  cardBlue: {
    backgroundColor: '#e8f4fd',
    border: '2 solid #1976d2',
  },
  cardGreen: {
    backgroundColor: '#e8f5e8',
    border: '2 solid #2e7d32',
  },
  cardOrange: {
    backgroundColor: '#fff8e1',
    border: '2 solid #f57c00',
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // PAYMENT OPTIONS STYLES
  paymentContainer: {
    backgroundColor: '#f5f5f5',
    border: '2 solid #4caf50',
    borderRadius: 4,
    padding: 15,
    marginTop: 10,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#061349',
  },
  originalPrice: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666666',
    textDecoration: 'line-through',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    margin: 5,
    padding: 12,
    borderRadius: 4,
    textAlign: 'center',
    position: 'relative',
  },
  paymentCash: {
    backgroundColor: '#e8f5e8',
    border: '2 solid #4caf50',
  },
  paymentInstallment: {
    backgroundColor: '#e3f2fd',
    border: '2 solid #2196f3',
  },
  discountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff5722',
    color: '#ffffff',
    borderRadius: 15,
    width: 30,
    height: 30,
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
  },
  
  // IMPLANTATION STYLES
  implantationSection: {
    marginBottom: 12,
  },
  implantationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#061349',
    marginBottom: 8,
  },
  implantationItem: {
    fontSize: 9,
    marginBottom: 3,
    paddingLeft: 10,
  },
  implantationNote: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  
  // FINAL MESSAGE STYLES
  finalMessage: {
    backgroundColor: '#e8f5e8',
    border: '2 solid #4caf50',
    borderRadius: 4,
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
  },
  finalMessageText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  
  // UTILITY STYLES
  textBold: { fontWeight: 'bold' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  mb5: { marginBottom: 5 },
  mb10: { marginBottom: 10 },
  mt10: { marginTop: 10 },
  
  // PAGE BREAK
  pageBreak: {
    pageBreakBefore: 'always',
  }
});

interface PDFDocumentProps {
  formData: FormData;
  pricing: PricingData;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ formData, pricing }) => {
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);
  const totalGeral = monthlyTotal + equipmentTotal + modul.modules.implantacao.price;
  const desconto = totalGeral * 0.05;
  const valorComDesconto = totalGeral - desconto;
  const valorParcela = totalGeral / 3;

  // Verificar se há adicionais
  const hasAdditionals = formData.additionals.legalLoyalty || 
                        formData.additionals.delivery !== 'none' || 
                        formData.additionals.selfServiceTerminals > 0;

  return (
    <Document>
      {/* PÁGINA 1: INFORMAÇÕES GERAIS */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            
            <Text style={styles.title}>Orçamento SEATEC | PDVLEGAL</Text>
            <Text style={styles.subtitle}>Sistema de Gestão | ERP + PDV</Text>
          </View>
          <Image style={styles.logo} src="./logo.png" />
        </View>

        {/* INFORMAÇÕES DO CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informações do Cliente</Text>
          <View style={styles.clientGrid}>
            <View style={styles.clientColumn}>
              <Text style={styles.clientInfo}>Nome: {formData.clientInfo.name}</Text>
              <Text style={styles.clientInfo}>Empresa: {formData.clientInfo.companyName}</Text>
              <Text style={styles.clientInfo}>CNPJ: {formData.clientInfo.cnpj}</Text>
            </View>
            <View style={styles.clientColumn}>
              <Text style={styles.clientInfo}>Telefone: {formData.clientInfo.phone}</Text>
              <Text style={styles.clientInfo}>Email: {formData.clientInfo.email}</Text>
            </View>
          </View>
        </View>

        {/* ASSINATURA MENSAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Assinatura Mensal</Text>
          <View style={styles.table}>
            {/* Header da tabela */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, styles.tableCol1]}>
                <Text>Módulo / Descrição</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol2]}>
                <Text>Qtd</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol3]}>
                <Text>Valor Unit.</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol4]}>
                <Text>Total</Text>
              </View>
            </View>

            {/* Cloud - Obrigatório */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.tableCol1]}>
                <Text style={styles.textBold}>{pricing.modules.cloud.name}</Text>
                <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.cloud.description}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol2]}>
                <Text>1x</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol3]}>
                <Text>R${formatCurrencyValue(pricing.modules.cloud.price)}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCol4]}>
                <Text style={styles.textBold}>R${formatCurrencyValue(pricing.modules.cloud.price)}</Text>
              </View>
            </View>

            {/* Módulos Opcionais */}
            {formData.subscription.fiscal && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text style={styles.textBold}>{pricing.modules.fiscal.name}</Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.fiscal.description}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>1x</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>R${formatCurrencyValue(pricing.modules.fiscal.price)}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text style={styles.textBold}>R${formatCurrencyValue(pricing.modules.fiscal.price)}</Text>
                </View>
              </View>
            )}
            {formData.subscription.fiscal2 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text style={styles.textBold}>{pricing.modules.fiscal2.name}</Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.fiscal2.description}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>1x</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>R${formatCurrencyValue(pricing.modules.fiscal2.price)}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text style={styles.textBold}>R${formatCurrencyValue(pricing.modules.fiscal2.price)}</Text>
                </View>
              </View>
            )}

            {formData.subscription.inventory && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text style={styles.textBold}>{pricing.modules.inventory.name}</Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.inventory.description}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>1x</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>R${formatCurrencyValue(pricing.modules.inventory.price)}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text style={styles.textBold}>R${formatCurrencyValue(pricing.modules.inventory.price)}</Text>
                </View>
              </View>
            )}

            {formData.subscription.financial && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text style={styles.textBold}>{pricing.modules.financial.name}</Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.financial.description}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>1x</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>R${formatCurrencyValue(pricing.modules.financial.price)}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text style={styles.textBold}>R${formatCurrencyValue(pricing.modules.financial.price)}</Text>
                </View>
              </View>
            )}

            {/* PDVs Adicionais */}
            {formData.subscription.pdvCount > 1 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text style={styles.textBold}>{pricing.modules.pdv.name} Adicional</Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.modules.pdv.description}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>{formData.subscription.pdvCount}x</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>R${formatCurrencyValue(pricing.modules.pdv.price)}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text style={styles.textBold}>R${formatCurrencyValue(formData.subscription.pdvCount * pricing.modules.pdv.price)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* MÓDULOS ADICIONAIS */}
        {hasAdditionals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Módulos Adicionais</Text>
            <View style={styles.table}>
              {/* Header da tabela */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text>Adicional / Descrição</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>Qtd</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>Valor Unit.</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text>Total</Text>
                </View>
              </View>

              {formData.additionals.legalLoyalty && (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.tableCol1]}>
                    <Text style={styles.textBold}>{pricing.additionals.legalLoyalty.name}</Text>
                    <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.additionals.legalLoyalty.description}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol2]}>
                    <Text>1x</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol3]}>
                    <Text>R${formatCurrencyValue(pricing.additionals.legalLoyalty.price)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol4]}>
                    <Text style={styles.textBold}>R${formatCurrencyValue(pricing.additionals.legalLoyalty.price)}</Text>
                  </View>
                </View>
              )}

              {formData.additionals.delivery === 'basic' && (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.tableCol1]}>
                    <Text style={styles.textBold}>{pricing.additionals.deliveryBasic.name}</Text>
                    <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.additionals.deliveryBasic.description}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol2]}>
                    <Text>1x</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol3]}>
                    <Text>R${formatCurrencyValue(pricing.additionals.deliveryBasic.price)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol4]}>
                    <Text style={styles.textBold}>R${formatCurrencyValue(pricing.additionals.deliveryBasic.price)}</Text>
                  </View>
                </View>
              )}

              {formData.additionals.delivery === 'plus' && (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.tableCol1]}>
                    <Text style={styles.textBold}>{pricing.additionals.deliveryPlus.name}</Text>
                    <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.additionals.deliveryPlus.description}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol2]}>
                    <Text>1x</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol3]}>
                    <Text>R${formatCurrencyValue(pricing.additionals.deliveryPlus.price)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol4]}>
                    <Text style={styles.textBold}>R${formatCurrencyValue(pricing.additionals.deliveryPlus.price)}</Text>
                  </View>
                </View>
              )}

              {formData.additionals.selfServiceTerminals > 0 && (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.tableCol1]}>
                    <Text style={styles.textBold}>{pricing.additionals.selfServiceTerminal.name}</Text>
                    <Text style={{ fontSize: 8, color: '#666666' }}>{pricing.additionals.selfServiceTerminal.description}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol2]}>
                    <Text>{formData.additionals.selfServiceTerminals}x</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol3]}>
                    <Text>R${formatCurrencyValue(pricing.additionals.selfServiceTerminal.price)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.tableCol4]}>
                    <Text style={styles.textBold}>R${formatCurrencyValue(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* TOTAL MENSALIDADE */}
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>💰 TOTAL MENSALIDADE: R${formatCurrencyValue(monthlyTotal)}</Text>
        </View>
      </Page>

      {/* PÁGINA 2: EQUIPAMENTOS (se houver) */}
      {equipmentTotal > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠️ Equipamentos</Text>
            <View style={styles.table}>
              {/* Header da tabela */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCol, styles.tableCol1]}>
                  <Text>Equipamento / Descrição</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol2]}>
                  <Text>Qtd</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol3]}>
                  <Text>Valor Unit.</Text>
                </View>
                <View style={[styles.tableCol, styles.tableCol4]}>
                  <Text>Total</Text>
                </View>
              </View>

              {Object.entries(formData.equipment).map(([key, quantity]) => {
                if (quantity > 0) {
                  const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                  if (equipmentItem) {
                    return (
                      <View key={key} style={styles.tableRow}>
                        <View style={[styles.tableCol, styles.tableCol1]}>
                          <Text style={styles.textBold}>{equipmentItem.name}</Text>
                          <Text style={{ fontSize: 8, color: '#666666' }}>{equipmentItem.description}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableCol2]}>
                          <Text>{quantity}x</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableCol3]}>
                          <Text>R${formatCurrencyValue(equipmentItem.price)}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableCol4]}>
                          <Text style={styles.textBold}>R${formatCurrencyValue(quantity * equipmentItem.price)}</Text>
                        </View>
                      </View>
                    );
                  }
                }
                return null;
              })}
            </View>

            {/* Galeria de Equipamentos */}
            <Text style={[styles.sectionTitle, styles.mt10]}>Equipamentos Selecionados:</Text>
            <View style={styles.equipmentGrid}>
              {Object.entries(formData.equipment).map(([key, quantity]) => {
                if (quantity > 0) {
                  const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                  const imageUrl = equipmentImages[key as keyof typeof equipmentImages];
                  
                  if (equipmentItem && imageUrl) {
                    return (
                      <View key={key} style={styles.equipmentItem}>
                        <Image style={styles.equipmentImage} src={imageUrl} />
                        <Text style={styles.equipmentName}>{equipmentItem.name}</Text>
                        <Text style={styles.equipmentDetails}>Qtd: {quantity}</Text>
                        <Text style={[styles.equipmentDetails, { color: '#1976d2', fontWeight: 'bold' }]}>
                          R${formatCurrencyValue(equipmentItem.price)}
                        </Text>
                      </View>
                    );
                  }
                }
                return null;
              })}
            </View>
          </View>

          {/* TOTAL EQUIPAMENTOS */}
          <View style={[styles.totalBox, { backgroundColor: '#fff8e1', borderColor: '#f57c00' }]}>
            <Text style={[styles.totalText, { color: '#f57c00' }]}>🛠️ TOTAL EQUIPAMENTOS: R${formatCurrencyValue(equipmentTotal)}</Text>
          </View>
        </Page>
      )}

      {/* PÁGINA 3: RESUMO FINANCEIRO */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.textCenter, { fontSize: 16, marginBottom: 20 }]}>💳 Resumo Financeiro</Text>
        
        {/* Componentes do Investimento */}
        <View style={styles.financialGrid}>
          <View style={[styles.financialCard, styles.cardBlue]}>
            <Text style={[styles.cardTitle, { color: '#1976d2' }]}>💰 Mensalidade</Text>
            <Text style={[styles.cardValue, { color: '#1976d2' }]}>R${formatCurrencyValue(monthlyTotal)}</Text>
          </View>
          
          <View style={[styles.financialCard, styles.cardGreen]}>
            <Text style={[styles.cardTitle, { color: '#2e7d32' }]}>🎧 Implantação Online</Text>
            <Text style={[styles.cardValue, { color: '#2e7d32' }]}>R${formatCurrencyValue(modul.modules.implantacao.price)}</Text>
            
          </View>

          {equipmentTotal > 0 && (
            <View style={[styles.financialCard, styles.cardOrange]}>
              <Text style={[styles.cardTitle, { color: '#f57c00' }]}>🛠️ Equipamentos</Text>
              <Text style={[styles.cardValue, { color: '#f57c00' }]}>R${formatCurrencyValue(equipmentTotal)}</Text>
            </View>
          )}
        </View>


        {/* INVESTIMENTO TOTAL */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>💼 INVESTIMENTO TOTAL</Text>
          <Text style={styles.originalPrice}>R${formatCurrencyValue(totalGeral)}</Text>

          {/* Opções de Pagamento */}
          <View style={styles.paymentOptions}>
            {/* À vista com desconto */}
            <View style={[styles.paymentOption, styles.paymentCash]}>
              <View style={styles.discountBadge}>
                <Text style={{ color: '#ffffff', fontSize: 6, fontWeight: 'bold' }}>5% OFF</Text>
              </View>
              <Text style={[styles.cardTitle, { color: '#2e7d32', marginBottom: 8 }]}>🤑 PAGAMENTO À VISTA</Text>
              <Text style={{ fontSize: 8, color: '#666666', marginBottom: 5 }}>
                Desconto: -R${formatCurrencyValue(desconto)}
              </Text>
              <Text style={[styles.cardValue, { color: '#2e7d32', fontSize: 14 }]}>
                R${formatCurrencyValue(valorComDesconto)}
              </Text>
              <Text style={{ fontSize: 8, color: '#2e7d32', fontWeight: 'bold', marginTop: 5 }}>
                💰 ECONOMIA DE R${formatCurrencyValue(desconto)}
              </Text>
            </View>

            {/* Parcelado */}
            <View style={[styles.paymentOption, styles.paymentInstallment]}>
              <Text style={[styles.cardTitle, { color: '#1976d2', marginBottom: 8 }]}>💳 PARCELADO SEM JUROS</Text>
              <Text style={[styles.cardValue, { color: '#1976d2', fontSize: 12, marginBottom: 5 }]}>
                3x de R${formatCurrencyValue(valorParcela)}
              </Text>
              <Text style={{ fontSize: 8, color: '#666666', marginBottom: 5 }}>
                Total: R${formatCurrencyValue(totalGeral)}
              </Text>
              <Text style={{ fontSize: 8, color: '#1976d2', fontWeight: 'bold' }}>
                📅 Sem juros no cartão
              </Text>
            </View>
          </View>

          {/* Detalhamento */}
          <Text style={{ fontSize: 8, color: '#666666', textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
            Mensalidade: R${formatCurrencyValue(monthlyTotal)} + Implantação: R${formatCurrencyValue(modul.modules.implantacao.price)}
            {equipmentTotal > 0 && ` + Equipamentos: R$${formatCurrencyValue(equipmentTotal)}`}
          </Text>
          
        </View>
        
        
          <Text style={{ fontSize: 8, color: '#666666', textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
           Requisito Minimo de rede para melhor performance do sistema, recomendamos a estrutura com roteador próprio de qualidade, NÃO RECOMENDAMOS APENAS O USO DO MODEM DA OPERADORA!
           
          </Text>
          <Image style={{maxWidth: '1020px', width: '100%',  height: 'auto', maxHeight: '1000px', objectFit: 'contain',  marginBottom: '0',}} src={equipmentImages.redeD} />  
        
        
        
  
         
      </Page>
      

      {/* PÁGINA 4: RESUMO IMPLANTAÇÃO */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.textCenter, { fontSize: 16, marginBottom: 20 }]}>RESUMO IMPLANTAÇÃO</Text>

        {/* Cardápio */}
        <View style={styles.implantationSection}>
          <Text style={styles.implantationTitle}>📋 Cardápio</Text>
          <Text style={styles.implantationItem}>☐ Importação de cardápio via planilha Excel</Text>
          <Text style={styles.implantationItem}>☐ Cadastro de cardápio – Até 100 itens*</Text>
          <Text style={styles.implantationNote}>
            *Em caso de modificadores ou itens extras como: queijo, tomate, leite condensado e outros, cada modificador contará como item no cardápio.
          </Text>
        </View>

        {/* Dados Fiscais */}
        <View style={styles.implantationSection}>
          <Text style={styles.implantationTitle}>🧾 Dados para emissão Fiscal</Text>
          <Text style={styles.implantationItem}>1. Enviar o comprovante de credenciamento no Estado para emissão de NFC-e;</Text>
          <Text style={styles.implantationItem}>2. Informar o CRT (Código de Regime Tributário);</Text>
          <Text style={styles.implantationItem}>3. Enviar o CSC (Código de Segurança do Contribuinte) com o devido ID;</Text>
          <Text style={styles.implantationItem}>4. Informar alíquotas de tributação que incidirão nos produtos (ICMS/ISS, CFOP, CST, PIS/COFINS);</Text>
          <Text style={styles.implantationItem}>5. Enviar o Certificado Digital A1 em arquivo PFX e senha;</Text>
          <Text style={styles.implantationItem}>6. Enviar o Token do IBPT - https://deolhonoimposto.ibpt.org.br/Site/PassoPasso</Text>
          <Text style={styles.implantationItem}>7. Planilha com descrição, grupo, preço de venda, NCM e CEST dos produtos.</Text>
        </View>

        {/* Jornada do Cliente */}
        <View style={styles.implantationSection}>
          <Text style={styles.implantationTitle}>🚀 Jornada do Cliente</Text>
          <Text style={styles.implantationItem}>
            Após o pagamento, faremos o faturamento de sua licença e, em até 1 dia útil um dos nossos Especialistas entrará em contato para conferência de dados e agendamento dos treinamentos.
          </Text>
          <Text style={styles.implantationItem}>
            Após a implantação, é só desfrutar de toda inovação e tecnologia que o PDV Legal levará para o seu negócio! 🤩
          </Text>
          <Text style={[styles.implantationItem, styles.textBold]}>
            Importante! Lembre-se de contar comigo em qualquer momento de nossa parceria. 😀
          </Text>
        </View>

        {/* Treinamento */}
        <View style={styles.implantationSection}>
          <Text style={styles.implantationTitle}>💻 Treinamento</Text>
          <Text style={styles.implantationItem}>
            Para o treinamento é imprescindível o uso do computador ou notebook, além dos equipamentos sugeridos para infraestrutura em mãos.
          </Text>
          <Text style={styles.implantationItem}>
            Nossos treinamentos são realizados de forma remota, via Google Meet. Mas não se preocupe, minutos antes de iniciar te enviaremos o link de acesso e qualquer dúvida nossos Especialistas estarão prontos para ajudar.
          </Text>
          <Text style={styles.implantationItem}>{(modul.modules.implantacao.description)}</Text>
          
        </View>

        {/* Horário e Atendimento */}
        <View style={styles.implantationSection}>
          <Text style={styles.implantationTitle}>🕑 Horário e canais de atendimento</Text>
          <Text style={styles.implantationItem}>Telefone/WhatsApp: 11 4210-1779</Text>
          <Text style={styles.implantationItem}>E-mail: suporte@seatec.com.br</Text>
          <Text style={styles.implantationItem}>Suporte Emergencial: Segunda a Segunda: 8h às 23:59h</Text>
          <Text style={styles.implantationItem}>Treinamentos e Dúvidas: Seg a Sexta: 9h às 18h</Text>
        </View>

        {/* Mensagem Final */}
        <View style={styles.finalMessage}>
          <Text style={styles.finalMessageText}>
            Agradecemos a confiança e desejamos que este seja o início de uma parceria de sucesso! 💙
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
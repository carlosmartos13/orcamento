r elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
                🛠️ Equipamentos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Equipamento / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(formData.equipment).map(([key, quantity]) => {
                      if (quantity > 0) {
                        const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                        if (equipmentItem) {
                          return (
                            <TableRow key={key}>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {equipmentItem.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.5, color: '#555' }}>
                                  {equipmentItem.description}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">{quantity}x</TableCell>
                              <TableCell align="right">R$ {formatCurrencyValue(equipmentItem.price)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                R$ {formatCurrencyValue(equipmentItem.price * quantity)}
                              </TableCell>
                            </TableRow>
                          );
                        }
                      }
                      return null;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Galeria de Imagens dos Equipamentos */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Equipamentos Selecionados:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(formData.equipment).map(([key, quantity]) => {
                    if (quantity > 0) {
                      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                      const imageUrl = equipmentImages[key as keyof typeof equipmentImages];
                      
                      if (equipmentItem && imageUrl) {
                        return (
                          <Grid item xs={6} sm={4} md={3} key={key}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 2, 
                              backgroundColor: '#fafafa',
                              minHeight: '200px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <img 
                                src={imageUrl} 
                                alt={equipmentItem.name}
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '120px', 
                                  height: 'auto',
                                  maxHeight: '100px',
                                  objectFit: 'contain',
                                  marginBottom: '12px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  backgroundColor: '#fff'
                                }} 
                              />
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.8rem' }}>
                                {equipmentItem.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                Quantidade: {quantity}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                R$ {formatCurrencyValue(equipmentItem.price)}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      }
                    }
                    return null;
                  })}
                </Grid>
              </Box>
            </Paper>

            {/* TOTAL EQUIPAMENTOS */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#fff8e1', border: '2px solid #f57c00' }}>
              <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold', textAlign: 'center' }}>
                🛠️ TOTAL EQUIPAMENTOS: R$ {formatCurrencyValue(equipmentTotal)}
              </Typography>
            </Paper>
          </>
        )}

        {/* Resumo Final */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
          <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            💳 Resumo Financeiro
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f4fd', borderRadius: 2, border: '1px solid #ccc' }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  Mensalidade
                </Typography>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  R$ {formatCurrencyValue(monthlyTotal)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #ccc' }}>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Implantação Online
                </Typography>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  R$ {formatCurrencyValue(implantacaoPrice)}
                </Typography>
              </Box>
            </Grid>
            {equipmentTotal > 0 && (
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff8e1', borderRadius: 2, border: '1px solid #ccc' }}>
                  <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                    Equipamentos (Único)
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                    R$ {formatCurrencyValue(equipmentTotal)}
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: '#ccc' }} />
              <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
                <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  INVESTIMENTO TOTAL
                </Typography>
                <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  R$ {formatCurrencyValue(monthlyTotal + equipmentTotal + implantacaoPrice)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  Mensalidade: R$ {formatCurrencyValue(monthlyTotal)} + Implantação: R$ {formatCurrencyValue(implantacaoPrice)} {equipmentTotal > 0 ? `+ Equipamentos: R$ ${formatCurrencyValue(equipmentTotal)}` : ''}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* BOTÕES FORA DO PDF */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleWhatsApp} 
          size="large"
          sx={{ 
            backgroundColor: '#25D366',
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: '#128C7E',
            }
          }}
        >
          📱 Enviar no WhatsApp
        </Button>
        <Button 
          variant="contained" 
          onClick={handleGeneratePDF} 
          disabled={isGeneratingPDF}
          size="large"
          sx={{ 
            backgroundColor: '#1976d2',
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          {isGeneratingPDF ? '⏳ Gerando PDF...' : '📄 Baixar PDF'}
        </Button>
      </Box>
    </>
  );
};

export default Summary;
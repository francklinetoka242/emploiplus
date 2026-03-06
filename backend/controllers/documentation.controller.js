import * as DocumentationModel from '../models/documentation.model.js';

// [SUPER_ADMIN, ADMIN] - Obtenir tous les documents
export async function getAllDocuments(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const documents = await DocumentationModel.getAllDocuments(parseInt(limit), parseInt(offset));
    const totalCount = await DocumentationModel.getDocumentCount();
    
    res.status(200).json({
      success: true,
      data: documents,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('getAllDocuments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
}

// [PUBLIC] - Obtenir un document public par slug
export async function getPublicDocument(req, res) {
  try {
    const { slug } = req.params;
    const document = await DocumentationModel.getDocumentBySlug(slug);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('getPublicDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Obtenir un document par ID
export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const document = await DocumentationModel.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('getDocumentById error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Créer un nouveau document
export async function createDocument(req, res) {
  try {
    const { name, slug, type, content } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation
    if (!name || !slug || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier que le slug est unique
    const existingDoc = await DocumentationModel.getDocumentBySlug(slug);
    if (existingDoc) {
      return res.status(409).json({
        success: false,
        message: 'Ce slug existe déjà'
      });
    }

    const document = await DocumentationModel.createDocument(name, slug, type, content, userId);
    
    res.status(201).json({
      success: true,
      message: 'Document créé avec succès',
      data: document
    });
  } catch (error) {
    console.error('createDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Mettre à jour un document
export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, type, content, is_published } = req.body;
    const userId = req.user.id; // From auth middleware

    // Vérifier que le document existe
    const existingDoc = await DocumentationModel.getDocumentById(id);
    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Utiliser le slug fourni ou garder l'existant
    const finalSlug = slug || existingDoc.slug;

    // Vérifier que le slug est unique (sauf pour le document courant)
    if (finalSlug !== existingDoc.slug) {
      const slugExists = await DocumentationModel.getDocumentBySlug(finalSlug);
      if (slugExists) {
        return res.status(409).json({
          success: false,
          message: 'Ce slug existe déjà'
        });
      }
    }

    const document = await DocumentationModel.updateDocument(
      id, 
      name || existingDoc.name, 
      finalSlug, 
      type || existingDoc.type, 
      content || existingDoc.content,
      is_published !== undefined ? is_published : existingDoc.is_published,
      userId
    );
    
    res.status(200).json({
      success: true,
      message: 'Document mis à jour avec succès',
      data: document
    });
  } catch (error) {
    console.error('updateDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Publier/Dépublier un document
export async function toggleDocumentPublish(req, res) {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    const userId = req.user.id; // From auth middleware

    // Vérifier que le document existe
    const existingDoc = await DocumentationModel.getDocumentById(id);
    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const document = await DocumentationModel.toggleDocumentPublish(id, is_published, userId);
    
    res.status(200).json({
      success: true,
      message: is_published ? 'Document publié avec succès' : 'Document dépublié avec succès',
      data: document
    });
  } catch (error) {
    console.error('toggleDocumentPublish error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Supprimer un document
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    // Vérifier que le document existe
    const existingDoc = await DocumentationModel.getDocumentById(id);
    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const success = await DocumentationModel.deleteDocument(id);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le document'
      });
    }
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
}

// [SUPER_ADMIN, ADMIN] - Obtenir les statistiques
export async function getDocumentStats(req, res) {
  try {
    const stats = await DocumentationModel.getDocumentStats();
    const totalCount = await DocumentationModel.getDocumentCount();
    
    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        byType: stats
      }
    });
  } catch (error) {
    console.error('getDocumentStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
}

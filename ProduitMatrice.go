package main

import "fmt"

func main() {
	var lignes1, colonnes1, lignes2, colonnes2, i, j int

	var mat1 [10][10]int
	var mat2 [10][10]int
	var matProd [10][10]int

	fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la première Matrice = ")
	fmt.Scan(&lignes1, &colonnes1)
	fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la deuxième Matrice = ")
	fmt.Scan(&lignes2, &colonnes2)
	if colonnes1 != lignes2 {
		fmt.Print("Produit Matriciel Impossible Veuillez réessayer ")
	}
	fmt.Print("Rentrer les termes de la première Matrice = ")
	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes1; j++ {
			fmt.Scan(&mat1[i][j])
		}
	}

	fmt.Print("Rentrer les termes de la deuxième Matrice = ")
	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes1; j++ {
			fmt.Scan(&mat2[i][j])
		}
	}

	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes2; j++ {
			matProd[i][j] = mat1[i][j] * mat2[i][j]
		}
	}
	fmt.Println("Le Résultat de Go pour la matrice produit = ")
	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes2; j++ {
			fmt.Print(matProd[i][j], "\t")
		}
		fmt.Println()
	}
}
